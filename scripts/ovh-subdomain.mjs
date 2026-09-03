// Publish one subdomain on the OVH web hosting, end to end.
//
//   node scripts/ovh-subdomain.mjs <zone> <sous-domaine> <dossier> [--apply]
//   node scripts/ovh-subdomain.mjs complorama.fr recherche complorama/api --apply
//
// Does the three things a new subdomain needs, and nothing else:
//   1. an A and an AAAA record pointing at the hosting, then a zone refresh
//      (without which the change stays pending on OVH's side)
//   2. the domain attached to the hosting, served from <dossier>
//   3. the free Let's Encrypt certificate for that name
//
// Without --apply it only reports what it would do. Every step is skipped if
// already done, so re-running is safe and is the way to resume after a
// timeout. It refuses to touch a record belonging to any other name: this
// zone also carries the live complorama.fr redirection and the MX records.

import { ovhClient, OvhError, redact } from './lib/ovh.mjs';

const [, , zone, sub, folder, ...flags] = process.argv;
const APPLY = flags.includes('--apply');
const service = process.env.OVH_SFTP_SERVICE || 'egoblog.net';

const die = (m) => { console.error(`✗ ${m}`); process.exit(1); };
if (!zone || !sub || !folder) die('usage: ovh-subdomain.mjs <zone> <sous-domaine> <dossier> [--apply]');
if (!/^[a-z0-9-]{1,40}$/.test(sub)) die(`sous-domaine invalide : ${sub}`);
if (!/^[a-z0-9][a-z0-9_/-]{1,60}$/.test(folder)) die(`dossier invalide : ${folder}`);
const fqdn = `${sub}.${zone}`;

const h = (t) => console.log(`\n${'─'.repeat(66)}\n${t}\n${'─'.repeat(66)}`);
const step = (done, msg) => console.log(`  ${done ? '✓' : APPLY ? '→' : '·'} ${msg}`);
const call = await ovhClient();

console.log(`${APPLY ? 'APPLICATION' : 'SIMULATION (ajouter --apply pour exécuter)'}`);
console.log(`${fqdn}  →  hébergement ${service}, dossier ${folder}`);

// ---------------------------------------------------------------- 1. DNS
h('1 · Enregistrements DNS');
const hosting = await call('GET', `/hosting/web/${service}`);
const targets = [['A', hosting.hostingIp], ['AAAA', hosting.hostingIpv6]].filter(([, v]) => v);
let dnsChanged = false;

for (const [fieldType, target] of targets) {
  const ids = await call('GET', `/domain/zone/${zone}/record?fieldType=${fieldType}&subDomain=${sub}`);
  if (ids.length) {
    const rec = await call('GET', `/domain/zone/${zone}/record/${ids[0]}`);
    if (rec.target === target) { step(true, `${fieldType} ${sub} → ${target} (déjà en place)`); continue; }
    step(false, `${fieldType} ${sub} pointe sur ${rec.target}, à corriger vers ${target}`);
    if (APPLY) { await call('PUT', `/domain/zone/${zone}/record/${ids[0]}`, { target, ttl: 3600 }); dnsChanged = true; }
    continue;
  }
  step(false, `créer ${fieldType} ${sub} → ${target}`);
  if (APPLY) { await call('POST', `/domain/zone/${zone}/record`, { fieldType, subDomain: sub, target, ttl: 3600 }); dnsChanged = true; }
}

if (dnsChanged) {
  // Mandatory: without it the records stay pending and never resolve.
  await call('POST', `/domain/zone/${zone}/refresh`);
  console.log('  ✓ zone rafraîchie');
} else if (APPLY) {
  console.log('  (rien à rafraîchir)');
}

// ------------------------------------------------------- 2. attachement
h('2 · Rattachement à l\'hébergement');
const attached = await call('GET', `/hosting/web/${service}/attachedDomain`);
let needsAttach = !attached.includes(fqdn);
if (!needsAttach) {
  const det = await call('GET', `/hosting/web/${service}/attachedDomain/${fqdn}`);
  step(true, `déjà rattaché — dossier ${det.path} · ssl=${det.ssl} · état ${det.status}`);
  if (det.path !== folder) {
    step(false, `dossier à corriger : ${det.path} → ${folder}`);
    if (APPLY) await call('PUT', `/hosting/web/${service}/attachedDomain/${fqdn}`, { path: folder, ssl: true });
  }
} else {
  step(false, `rattacher ${fqdn} au dossier ${folder}, avec SSL`);
  if (APPLY) {
    const task = await call('POST', `/hosting/web/${service}/attachedDomain`, { domain: fqdn, path: folder, ssl: true });
    console.log(`    tâche ${JSON.stringify(redact(task))}`);
    for (let i = 0; i < 30; i++) {
      await new Promise((r) => setTimeout(r, 6000));
      const now = await call('GET', `/hosting/web/${service}/attachedDomain`);
      if (now.includes(fqdn)) { console.log(`    ✓ rattaché après ${(i + 1) * 6}s`); needsAttach = false; break; }
      if (i % 3 === 2) console.log(`    … ${(i + 1) * 6}s`);
    }
    if (needsAttach) console.log('    ⚠ pas encore visible ; relancer ce workflow pour reprendre.');
  }
}

// -------------------------------------------------------------- 3. SSL
h('3 · Certificat');
if (APPLY && !needsAttach) {
  let ssl = null;
  try { ssl = await call('GET', `/hosting/web/${service}/attachedDomain/${fqdn}/ssl`); } catch (e) { if (!(e instanceof OvhError)) throw e; }
  if (ssl && ssl.status) {
    step(true, `certificat ${ssl.provider || ''} · ${ssl.status}`);
  } else {
    step(false, 'demander le certificat Let\'s Encrypt gratuit');
    try {
      await call('POST', `/hosting/web/${service}/attachedDomain/${fqdn}/ssl`);
      console.log('    demande envoyée — l\'émission prend quelques minutes');
    } catch (e) {
      console.log(`    ${e instanceof OvhError ? `(HTTP ${e.status} — ${e.data?.message || ''})` : e.message}`);
      console.log('    → souvent normal : le certificat suit automatiquement le rattachement avec ssl=true.');
    }
  }
} else {
  step(false, 'certificat Let\'s Encrypt (après rattachement)');
}

console.log(`\n${APPLY ? 'Terminé.' : 'Simulation terminée — rien n\'a été modifié.'}`);
console.log(`Vérifier ensuite de l'extérieur : Tools · HTTP probe sur ${fqdn}`);
