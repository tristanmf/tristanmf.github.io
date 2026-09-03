// Create (or re-password) a dedicated SFTP user on the OVH web hosting,
// confined to one folder — so a deployment job can never reach the other
// sites sharing the account (WordPress, Blogtrotters, TMF Lab).
//
//   OVH_SFTP_PASSWORD=… node scripts/ovh-sftp-user.mjs <serviceName> <home> [sshState]
//
// Idempotent: if the user already exists its password is reset to the
// secret's current value, so re-running after a password rotation is safe.
//
// The password comes from the environment and is masked in the Actions log
// before anything else happens. The login is never printed either: it is
// derived from the hosting's primaryLogin, so the deployment script can
// recompute it the same way without either of them writing it down. The
// repository is public and so are its logs.

import { ovhClient, OvhError, redact } from './lib/ovh.mjs';

const [, , serviceName, home, sshState = 'none'] = process.argv;
const password = process.env.OVH_SFTP_PASSWORD || '';

if (password) console.log(`::add-mask::${password}`);
const die = (m) => { console.error(`✗ ${m}`); process.exit(1); };

if (!serviceName) die('usage: ovh-sftp-user.mjs <serviceName> <home> [sshState]');
if (!home || !/^[a-z0-9][a-z0-9_-]{1,30}$/.test(home)) die(`home invalide : « ${home} » (minuscules, chiffres, - et _)`);
// Never point the confined user at a folder that already serves a live site.
for (const forbidden of ['www', 'blogtrotters', 'tmflab', 'complorama-redir', 'cgi-bin', 'ssl']) {
  if (home === forbidden) die(`home refusé : « ${home} » sert déjà un site en production`);
}
if (!password) die('OVH_SFTP_PASSWORD absent de l\'environnement (secret du dépôt)');
if (password.length < 12) die('le mot de passe fait moins de 12 caractères — trop court pour un compte exposé');

const call = await ovhClient();

// The login must be derived, not stored: primaryLogin is a personal field.
const info = await call('GET', `/hosting/web/${serviceName}`);
const primary = info.primaryLogin;
if (!primary) die('primaryLogin introuvable sur cet hébergement');
console.log(`::add-mask::${primary}`);
const login = `${primary}-cplr`;
console.log(`::add-mask::${login}`);

console.log(`hébergement ${serviceName} · offre ${info.offer}`);
console.log(`utilisateur visé : «masqué» (préfixe du compte + « -cplr »)`);
console.log(`dossier          : ${home}   ·   accès SSH demandé : ${sshState}`);

const existing = await call('GET', `/hosting/web/${serviceName}/user`);
console.log(`utilisateurs actuels sur l'hébergement : ${existing.length}`);

let task;
if (existing.includes(login)) {
  console.log('\nl\'utilisateur existe déjà → remise à jour du mot de passe');
  task = await call('POST', `/hosting/web/${serviceName}/user/${login}/changePassword`, { password });
} else {
  console.log('\ncréation de l\'utilisateur');
  try {
    task = await call('POST', `/hosting/web/${serviceName}/user`, { home, login, password, sshState });
  } catch (e) {
    if (e instanceof OvhError) {
      console.error(`\n✗ création refusée (HTTP ${e.status})`);
      console.error(`  ${typeof e.data === 'object' && e.data && e.data.message ? e.data.message : JSON.stringify(e.data)}`);
      if (e.status === 400) console.error("  → si le message cite sshState, relancer avec une valeur listée par « Tools · OVH API schema » (/hosting/web, filtre SshStateEnum).");
      if (e.status === 403) console.error("  → l'offre n'autorise peut-être pas d'utilisateur supplémentaire ; repli : réutiliser le compte principal.");
      process.exit(2);
    }
    throw e;
  }
}

console.log(`\ntâche OVH : ${JSON.stringify(redact(task))}`);

// The hosting applies the change asynchronously; wait for the user to show up.
const taskId = task && (task.id ?? task.taskId);
for (let i = 0; i < 20; i++) {
  await new Promise((r) => setTimeout(r, 6000));
  let state = '?';
  if (taskId) {
    try { state = (await call('GET', `/hosting/web/${serviceName}/tasks/${taskId}`)).status; }
    catch { state = 'terminée (tâche déjà purgée)'; }
  }
  const users = await call('GET', `/hosting/web/${serviceName}/user`);
  const present = users.includes(login);
  console.log(`  ${(i + 1) * 6}s — tâche ${state} · utilisateur présent : ${present ? 'oui' : 'pas encore'}`);
  if (present && /done|terminée/i.test(String(state))) {
    const u = await call('GET', `/hosting/web/${serviceName}/user/${login}`);
    console.log(`\n✓ prêt — dossier ${u.home} · SSH ${u.sshState} · état ${u.state}`);
    console.log(`  hôte SFTP : ${info.serviceManagementAccess?.ssh?.url || 'ssh.cluster113.hosting.ovh.net'}`);
    process.exit(0);
  }
}
console.log('\n⚠ la tâche n\'est pas confirmée terminée après 2 minutes — relancer ce workflow pour vérifier (il est idempotent).');
