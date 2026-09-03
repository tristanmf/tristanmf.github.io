// Read and write files on the OVH hosting over SFTP, from GitHub Actions,
// using the dedicated account confined to one folder.
//
//   node scripts/ovh-sftp.mjs list  [dossier]
//   node scripts/ovh-sftp.mjs get   <distant> <local>
//   node scripts/ovh-sftp.mjs put   <local> <distant>
//   node scripts/ovh-sftp.mjs mkdir <dossier>
//
// Credentials: the password comes from OVH_SFTP_PASSWORD and is masked
// before the first connection; the login is recomputed from the hosting's
// primaryLogin rather than stored anywhere, and never printed. The
// repository is public and so are these logs — see scripts/ovh-sftp-user.mjs,
// which created the account the same way.
//
// Requires ssh2-sftp-client (installed by the workflow, not vendored: this
// never runs in a browser and never reaches the published site).

import { ovhClient } from './lib/ovh.mjs';
import { createRequire } from 'node:module';
import { statSync } from 'node:fs';

const require = createRequire(import.meta.url);
const Client = require('ssh2-sftp-client');

const [, , cmd, a, b] = process.argv;
const password = process.env.OVH_SFTP_PASSWORD || '';
const service = process.env.OVH_SFTP_SERVICE || 'egoblog.net';
if (password) console.log(`::add-mask::${password}`);

const die = (m) => { console.error(`✗ ${m}`); process.exit(1); };
if (!['list', 'get', 'put', 'mkdir'].includes(cmd || '')) die('usage: ovh-sftp.mjs <list|get|put|mkdir> …');
if (!password) die('OVH_SFTP_PASSWORD absent de l\'environnement');

const call = await ovhClient();
const info = await call('GET', `/hosting/web/${service}`);
const primary = info.primaryLogin;
if (!primary) die('primaryLogin introuvable');
console.log(`::add-mask::${primary}`);
const username = `${primary}-cplr`;
console.log(`::add-mask::${username}`);
const host = (info.serviceManagementAccess?.ssh?.url) || 'ssh.cluster113.hosting.ovh.net';
const port = Number(info.serviceManagementAccess?.ssh?.port) || 22;

const size = (n) => n >= 1048576 ? `${(n / 1048576).toFixed(1)} Mo` : n >= 1024 ? `${(n / 1024).toFixed(1)} Ko` : `${n} o`;

const sftp = new Client();
try {
  await sftp.connect({ host, port, username, password, readyTimeout: 25000 });
  console.log(`connecté à ${host}:${port} — compte cloisonné «masqué»`);
  const cwd = await sftp.cwd();
  console.log(`dossier de départ : ${cwd}`);

  if (cmd === 'list') {
    const dir = a || cwd || '.';
    const rows = await sftp.list(dir);
    console.log(`\n${dir} — ${rows.length} entrée(s)\n`);
    for (const r of rows.sort((x, y) => (x.type === 'd' ? -1 : 1) - (y.type === 'd' ? -1 : 1) || x.name.localeCompare(y.name))) {
      console.log(`  ${r.type === 'd' ? 'dossier' : 'fichier'.padEnd(7)}  ${String(r.name).padEnd(34)} ${r.type === 'd' ? '' : size(r.size).padStart(10)}  ${new Date(r.modifyTime).toISOString().slice(0, 16).replace('T', ' ')}`);
    }
  }

  if (cmd === 'get') {
    if (!a || !b) die('usage: get <distant> <local>');
    if (!(await sftp.exists(a))) die(`fichier distant introuvable : ${a}`);
    await sftp.fastGet(a, b);
    console.log(`\n✓ ${a} → ${b} (${size(statSync(b).size)})`);
  }

  if (cmd === 'put') {
    if (!a || !b) die('usage: put <local> <distant>');
    const dir = b.replace(/\/[^/]*$/, '');
    if (dir && dir !== b && !(await sftp.exists(dir))) { await sftp.mkdir(dir, true); console.log(`dossier créé : ${dir}`); }
    await sftp.fastPut(a, b);
    const remote = await sftp.stat(b);
    const local = statSync(a).size;
    console.log(`\n✓ ${a} → ${b} (${size(remote.size)})`);
    if (remote.size !== local) die(`taille distante ${remote.size} ≠ locale ${local} — transfert incomplet`);
  }

  if (cmd === 'mkdir') {
    if (!a) die('usage: mkdir <dossier>');
    await sftp.mkdir(a, true);
    console.log(`\n✓ dossier ${a} créé`);
  }
} catch (e) {
  const msg = String(e && e.message || e);
  console.error(`✗ ${msg}`);
  if (/authentication|All configured authentication methods failed/i.test(msg)) {
    console.error("  → le mot de passe du secret ne correspond pas au compte ; relancer « Tools · OVH SFTP user » le remet à jour.");
  }
  if (/No such file|ENOENT/i.test(msg)) {
    console.error("  → chemin hors du dossier autorisé ? Ce compte est cloisonné : il ne voit ni www/, ni blogtrotters, ni tmflab.");
  }
  process.exitCode = 2;
} finally {
  await sftp.end().catch(() => {});
}
