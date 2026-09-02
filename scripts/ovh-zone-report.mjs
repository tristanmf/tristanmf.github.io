// Full picture of one OVH zone in a single run — read-only.
//
//   node scripts/ovh-zone-report.mjs <zone> [--no-hosting]
//
// Prints:
//   1. the domain's settings (nameserver type, lock, DNSSEC…)
//   2. every DNS record, expanded (type · name · ttl · target)
//   3. every OVH web redirection on the zone, expanded
//   4. unless --no-hosting: every OVH web hosting of the account, with its
//      attached domains — highlighting those that belong to <zone> — and
//      their SSL state, plus the hosting's own SSL certificate status.
//      This is where "complorama.fr → tristan.pro/complorama" style
//      forwards usually live when the zone has no redirection object.
//
// Personal fields are masked before printing (public repo ⇒ public logs).

import { ovhClient, OvhError, redact } from './lib/ovh.mjs';

const zone = (process.argv[2] || '').trim().toLowerCase();
const withHosting = !process.argv.includes('--no-hosting');
if (!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(zone)) { console.error('✗ usage: ovh-zone-report.mjs <zone> [--no-hosting]'); process.exit(1); }

const h = (t) => console.log(`\n${'═'.repeat(70)}\n${t}\n${'═'.repeat(70)}`);
const fail = (e) => e instanceof OvhError ? `(HTTP ${e.status}${e.data && e.data.message ? ` — ${e.data.message}` : ''})` : `(${e.message})`;

let call;
try { call = await ovhClient(); } catch (e) { console.error(`✗ ${e.message}`); process.exit(1); }

// 1. domain settings
h(`1 · Domaine ${zone}`);
try { console.log(JSON.stringify(redact(await call('GET', `/domain/${zone}`)), null, 2)); }
catch (e) { console.log(`  ${fail(e)}`); }

// 2. records
h(`2 · Enregistrements DNS de ${zone}`);
try {
  const ids = await call('GET', `/domain/zone/${zone}/record`);
  const recs = [];
  for (const id of ids) recs.push(await call('GET', `/domain/zone/${zone}/record/${id}`));
  recs.sort((a, b) => (a.subDomain || '').localeCompare(b.subDomain || '') || a.fieldType.localeCompare(b.fieldType));
  console.log(`  ${recs.length} enregistrement(s)\n`);
  console.log('  ' + 'NOM'.padEnd(22) + 'TYPE'.padEnd(7) + 'TTL'.padEnd(7) + 'CIBLE');
  for (const r of recs) console.log('  ' + (r.subDomain || '@').padEnd(22) + r.fieldType.padEnd(7) + String(r.ttl).padEnd(7) + r.target + `   [id ${r.id}]`);
} catch (e) { console.log(`  ${fail(e)}`); }

// 3. redirections
h(`3 · Redirections web OVH sur ${zone}`);
try {
  const ids = await call('GET', `/domain/zone/${zone}/redirection`);
  if (!ids.length) console.log('  (aucune — le domaine n\'utilise pas le service de redirection d\'OVH)');
  for (const id of ids) console.log(JSON.stringify(redact(await call('GET', `/domain/zone/${zone}/redirection/${id}`)), null, 2));
} catch (e) { console.log(`  ${fail(e)}`); }

// 4. hostings
if (withHosting) {
  h('4 · Hébergements web OVH');
  const inZone = (d) => d === zone || d.endsWith('.' + zone);
  // The account-wide list needs the bare right "GET /hosting/web" (OVH
  // wildcards such as /hosting/web/* do not cover it). When it is refused,
  // fall back to "which hosting(s) is <zone> / www.<zone> attached to?",
  // which only needs /hosting/web/* — enough for a zone-centric report.
  let services = [];
  try {
    services = await call('GET', '/hosting/web');
    console.log(`  ${services.length} hébergement(s) sur le compte`);
  } catch (e) {
    console.log(`  liste complète du compte indisponible ${fail(e)}`);
    console.log(`  → repli : hébergement(s) auxquels ${zone} / www.${zone} sont rattachés`);
    for (const d of [zone, `www.${zone}`]) {
      try {
        for (const sn of await call('GET', `/hosting/web/attachedDomain?domain=${encodeURIComponent(d)}`)) if (!services.includes(sn)) services.push(sn);
      } catch (e2) { console.log(`    ${d} : ${fail(e2)}`); }
    }
  }
  if (!services.length) console.log('  (aucun hébergement web trouvé)');
  for (const sn of services) {
    let info = {}; try { info = await call('GET', `/hosting/web/${sn}`); } catch (e) { info = { error: fail(e) }; }
    console.log(`\n  ▸ ${sn}  —  ${info.displayName || ''}  ·  ${info.offer || ''}  ·  état ${info.state || '?'}  ·  cluster ${info.cluster || '?'}  ·  IP ${info.hostingIp || '?'}${info.error ? `  ${info.error}` : ''}`);

    let sslInfo = null; try { sslInfo = await call('GET', `/hosting/web/${sn}/ssl`); } catch (e) { sslInfo = { none: fail(e) }; }
    console.log(`    certificat SSL de l'hébergement : ${sslInfo && !sslInfo.none ? `${sslInfo.provider || '?'} · ${sslInfo.type || '?'} · ${sslInfo.status || '?'}${sslInfo.regenerable !== undefined ? ` · regenerable=${sslInfo.regenerable}` : ''}` : `aucun ${sslInfo && sslInfo.none ? sslInfo.none : ''}`}`);
    let sslDomains = null; try { sslDomains = await call('GET', `/hosting/web/${sn}/ssl/domains`); } catch (e) { console.log(`    noms couverts par le certificat : ${fail(e)}`); }
    if (Array.isArray(sslDomains)) {
      console.log(`    noms couverts par le certificat (${sslDomains.length}) : ${sslDomains.join(', ') || '—'}`);
      const covered = sslDomains.filter(inZone);
      console.log(`    → ${zone} : ${covered.length ? `✓ couvert (${covered.join(', ')})` : `✗ NON couvert par le certificat → avertissement de sécurité sur https://${zone}/`}`);
    }

    let attached = []; try { attached = await call('GET', `/hosting/web/${sn}/attachedDomain`); } catch (e) { console.log(`    domaines attachés : ${fail(e)}`); continue; }
    console.log(`    domaines attachés (${attached.length}) : ${attached.join(', ') || '—'}`);
    for (const d of attached.filter(inZone)) {
      try {
        const det = await call('GET', `/hosting/web/${sn}/attachedDomain/${d}`);
        console.log(`    ★ ${d} → dossier ${det.path ?? '?'} · ssl=${det.ssl} · cdn=${det.cdn ?? '—'} · firewall=${det.firewall ?? '—'} · état ${det.status ?? '?'}`);
        console.log(`      ${JSON.stringify(redact(det))}`);
      } catch (e) { console.log(`    ★ ${d} : ${fail(e)}`); }
    }
  }
}
console.log('');
