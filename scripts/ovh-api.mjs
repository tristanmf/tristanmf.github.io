// One signed call to the OVHcloud API — Node built-ins only.
//
//   node scripts/ovh-api.mjs <METHOD> <path> [json-body] [--quiet]
//
//   node scripts/ovh-api.mjs GET  /domain/zone
//   node scripts/ovh-api.mjs GET  /domain/zone/complorama.fr/record
//   node scripts/ovh-api.mjs POST /domain/zone/complorama.fr/record '{"fieldType":"A","subDomain":"","target":"185.199.108.153","ttl":3600}'
//   node scripts/ovh-api.mjs POST /domain/zone/complorama.fr/refresh      # ← required after record changes
//
// Credentials from the environment (GitHub Actions secrets in CI); see
// scripts/lib/ovh.mjs. Output hygiene: this repo is public, so Actions logs
// are public — personal fields are masked, and --quiet prints only the HTTP
// status and the shape of the response.

import { ovhClient, OvhError, redact, summarize, explainStatus } from './lib/ovh.mjs';

const [, , METHOD = '', PATH = '', BODY_ARG = '', ...FLAGS] = process.argv;
const QUIET = FLAGS.includes('--quiet') || BODY_ARG === '--quiet';
const BODY = BODY_ARG && BODY_ARG !== '--quiet' ? BODY_ARG : '';

function die(msg, code = 1) { console.error(`✗ ${msg}`); process.exit(code); }

if (!/^(GET|POST|PUT|DELETE)$/.test(METHOD)) die('usage: ovh-api.mjs <GET|POST|PUT|DELETE> </path> [json-body] [--quiet]');
if (!PATH.startsWith('/')) die('path must start with "/" (e.g. /domain/zone)');
if (BODY) { try { JSON.parse(BODY); } catch { die('body is not valid JSON'); } }

try {
  const call = await ovhClient();
  const data = await call(METHOD, PATH, BODY);
  console.log(`${METHOD} ${PATH} → HTTP 200`);
  console.log(QUIET ? `  ${summarize(data)}` : JSON.stringify(redact(data), null, 2));
} catch (e) {
  if (e instanceof OvhError) {
    console.log(`${METHOD} ${PATH} → HTTP ${e.status}`);
    const hint = explainStatus(e.status, METHOD, PATH); if (hint) console.error(`  → ${hint}`);
    console.error(`  ${e.message}`);
    process.exit(2);
  }
  die(e.message);
}
