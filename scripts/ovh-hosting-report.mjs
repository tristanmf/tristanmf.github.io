// Full picture of one OVH web hosting in a single run — read-only.
//
//   node scripts/ovh-hosting-report.mjs <serviceName>
//
// Prints what matters before deciding whether a backend can live there:
//   1. the offer, its disk quota and state
//   2. the PHP/engine configuration actually running (ovhConfig)
//   3. the databases: how many, what engine, what size, what is left
//   4. the runtimes available (PHP versions, Node…) and the cron slots
//   5. the attached domains with the folder each one serves
//
// Personal fields, logins and database names are masked before printing
// (public repo ⇒ public Actions logs). Quotas, versions and counts are not
// sensitive and are printed in clear.

import { ovhClient, OvhError, redact } from './lib/ovh.mjs';

const sn = (process.argv[2] || '').trim().toLowerCase();
if (!sn) { console.error('✗ usage: ovh-hosting-report.mjs <serviceName>   e.g. egoblog.net'); process.exit(1); }

const h = (t) => console.log(`\n${'═'.repeat(70)}\n${t}\n${'═'.repeat(70)}`);
const fail = (e) => e instanceof OvhError ? `(HTTP ${e.status}${e.data && e.data.message ? ` — ${e.data.message}` : ''})` : `(${e.message})`;
const size = (q) => q && typeof q === 'object' && q.value != null ? `${q.value} ${q.unit || ''}`.trim() : (q ?? '—');

let call;
try { call = await ovhClient(); } catch (e) { console.error(`✗ ${e.message}`); process.exit(1); }
/** Call and return the data, or null after printing why it failed. */
const get = async (path, label) => {
  try { return await call('GET', path); }
  catch (e) { console.log(`  ${label || path} : ${fail(e)}`); return null; }
};

// 1. the hosting itself
h(`1 · Hébergement ${sn}`);
const info = await get(`/hosting/web/${sn}`);
if (info) {
  console.log(`  offre           : ${info.offer}   (${info.resourceType}, état ${info.state})`);
  console.log(`  espace disque   : ${size(info.quotaSize)}   utilisé ${size(info.quotaUsed)}`);
  console.log(`  trafic          : ${size(info.trafficQuotaSize)}   utilisé ${size(info.trafficQuotaUsed)}`);
  console.log(`  cluster / IP    : ${info.cluster} · ${info.hostingIp} · ${info.hostingIpv6 || '—'}`);
  console.log(`  SSL multiple    : ${info.multipleSSL}   ·   CDN : ${info.hasCdn}   ·   boost : ${info.boostOffer || 'aucun'}`);
  console.log(`  serviceManagedBy: ${info.serviceManagementAccess ? JSON.stringify(info.serviceManagementAccess) : '—'}`);
}

// 2. the engine actually configured (PHP version, environment, firewall)
h('2 · Configuration en place (ovhConfig)');
const cfgIds = await get(`/hosting/web/${sn}/ovhConfig`);
for (const id of (cfgIds || []).slice(0, 10)) {
  const c = await get(`/hosting/web/${sn}/ovhConfig/${id}`, `ovhConfig ${id}`);
  if (c) console.log(`  ▸ ${c.engineName || '?'} ${c.engineVersion || '?'}   env=${c.environment || '—'}   container=${c.container || '—'}   httpFirewall=${c.httpFirewall || '—'}   path=${c.path || '/'}   [id ${id}]`);
}
const reco = await get(`/hosting/web/${sn}/ovhConfigRecommendedValues`, 'valeurs recommandées');
if (reco) console.log(`  recommandé par OVH : ${reco.engineName || '?'} ${reco.engineVersion || '?'} (env ${reco.environment || '—'})`);

// 3. databases
h('3 · Bases de données');
const dbs = await get(`/hosting/web/${sn}/database`);
if (Array.isArray(dbs)) {
  console.log(`  ${dbs.length} base(s) rattachée(s) à l'hébergement`);
  for (const name of dbs) {
    const d = await get(`/hosting/web/${sn}/database/${encodeURIComponent(name)}`, 'base');
    if (d) console.log(`  ▸ ${d.type || '?'} ${d.version || ''}   quota ${size(d.quotaSize)}   utilisé ${size(d.quotaUsed)}   serveur ${d.server || '?'}   état ${d.state || '?'}   (nom masqué)`);
  }
}
const caps = await get(`/hosting/web/${sn}/databaseCreationCapabilities`, 'capacités de création de base');
if (Array.isArray(caps)) for (const c of caps) console.log(`  peut créer : ${c.type || '?'} ${c.version || ''} · quota ${size(c.quotaSize)} · restantes ${c.available ?? '?'}`);
const priv = await get(`/hosting/web/${sn}/privateDatabases`, 'bases privées liées');
if (Array.isArray(priv)) console.log(`  bases privées (SQL dédié) liées : ${priv.length ? priv.length : 'aucune'}`);

// 4. runtimes and cron
h('4 · Runtimes disponibles et tâches planifiées');
const types = await get(`/hosting/web/${sn}/runtimeAvailableTypes`, 'types de runtime');
if (Array.isArray(types)) console.log(`  types de backend disponibles : ${types.join(', ') || '—'}`);
const rtIds = await get(`/hosting/web/${sn}/runtime`, 'runtimes configurés');
for (const id of (rtIds || []).slice(0, 10)) {
  const r = await get(`/hosting/web/${sn}/runtime/${id}`, `runtime ${id}`);
  if (r) console.log(`  ▸ runtime ${r.type || '?'}   publicDir=${r.publicDir || '—'}   défaut=${r.isDefault}   [id ${id}]`);
}
const crons = await get(`/hosting/web/${sn}/cron`, 'cron');
if (Array.isArray(crons)) {
  console.log(`  tâches cron configurées : ${crons.length}`);
  for (const id of crons.slice(0, 10)) {
    const c = await get(`/hosting/web/${sn}/cron/${id}`, `cron ${id}`);
    if (c) console.log(`  ▸ ${c.command || '?'} — ${c.frequency || `${c.minute ?? '*'} ${c.hour ?? '*'} ${c.day ?? '*'} ${c.month ?? '*'} ${c.weekDay ?? '*'}`} · langage ${c.language || '—'} · état ${c.state || '—'}`);
  }
}

// 5. attached domains and the folder each serves
h('5 · Domaines attachés et dossier servi');
const attached = await get(`/hosting/web/${sn}/attachedDomain`);
if (Array.isArray(attached)) {
  console.log(`  ${attached.length} domaine(s)\n`);
  console.log('  ' + 'DOMAINE'.padEnd(32) + 'DOSSIER'.padEnd(28) + 'SSL   FIREWALL');
  for (const d of attached) {
    const det = await get(`/hosting/web/${sn}/attachedDomain/${d}`, d);
    if (det) console.log('  ' + d.padEnd(32) + String(det.path || '—').padEnd(28) + `${det.ssl ? 'oui' : 'non'}   ${det.firewall || '—'}`);
  }
}

h('6 · Modules installés (CMS posés par OVH)');
const mods = await get(`/hosting/web/${sn}/module`, 'modules');
if (Array.isArray(mods)) {
  console.log(`  ${mods.length} module(s)`);
  for (const id of mods.slice(0, 20)) {
    const m = await get(`/hosting/web/${sn}/module/${id}`, `module ${id}`);
    if (m) console.log(`  ▸ ${JSON.stringify(redact(m)).slice(0, 300)}`);
  }
}
console.log('');
