// Minimal signed client for the OVHcloud API — Node 24 built-ins only.
//
//   node scripts/ovh-api.mjs <METHOD> <path> [json-body] [--quiet]
//
//   node scripts/ovh-api.mjs GET  /domain/zone
//   node scripts/ovh-api.mjs GET  /domain/zone/complorama.fr/record
//   node scripts/ovh-api.mjs POST /domain/zone/complorama.fr/record '{"fieldType":"A","subDomain":"","target":"185.199.108.153","ttl":3600}'
//   node scripts/ovh-api.mjs POST /domain/zone/complorama.fr/refresh      # ← required after record changes
//
// Credentials come from the environment (GitHub Actions secrets in CI):
//   OVH_APP_KEY, OVH_APP_SECRET, OVH_CONSUMER_KEY, optional OVH_ENDPOINT
//   (default https://eu.api.ovh.com/1.0).
//
// Signature scheme (OVH "$1$" v1): SHA1 hex of
//   APP_SECRET + "+" + CONSUMER_KEY + "+" + METHOD + "+" + FULL_URL + "+" + BODY + "+" + TIMESTAMP
// with TIMESTAMP corrected by the server/client clock delta from GET /auth/time.
//
// Output hygiene: this repo is public, so Actions logs are public. Values of
// obviously personal keys are masked (GitHub ::add-mask:: + local redaction)
// and --quiet prints only the HTTP status and the shape of the response.

import { createHash } from 'node:crypto';

const [, , METHOD = '', PATH = '', BODY_ARG = '', ...FLAGS] = process.argv;
const QUIET = FLAGS.includes('--quiet') || BODY_ARG === '--quiet';
const BODY = BODY_ARG && BODY_ARG !== '--quiet' ? BODY_ARG : '';

const ENDPOINT = (process.env.OVH_ENDPOINT || 'https://eu.api.ovh.com/1.0').replace(/\/$/, '');
const AK = process.env.OVH_APP_KEY, AS = process.env.OVH_APP_SECRET, CK = process.env.OVH_CONSUMER_KEY;

function die(msg, code = 1) { console.error(`✗ ${msg}`); process.exit(code); }

if (!/^(GET|POST|PUT|DELETE)$/.test(METHOD)) die('usage: ovh-api.mjs <GET|POST|PUT|DELETE> </path> [json-body] [--quiet]');
if (!PATH.startsWith('/')) die('path must start with "/" (e.g. /domain/zone)');
if (!AK || !AS || !CK) die('missing OVH_APP_KEY / OVH_APP_SECRET / OVH_CONSUMER_KEY in the environment (GitHub → Settings → Secrets → Actions)');
if (BODY) { try { JSON.parse(BODY); } catch { die('body is not valid JSON'); } }

const SENSITIVE = /^(email|phone|fax|address|line1|line2|city|zip|firstname|lastname|name|legalform|nichandle|vat|birthDay|birthCity|nationalIdentificationNumber|authInfo|password|secret|token|consumerKey|applicationKey|applicationSecret)$/i;

function redact(value) {
  if (Array.isArray(value)) return value.map(redact);
  if (value && typeof value === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      if (SENSITIVE.test(k) && (typeof v === 'string' || typeof v === 'number')) {
        if (String(v).length) console.log(`::add-mask::${v}`); // GitHub masks any later occurrence in the log
        out[k] = '«masqué»';
      } else out[k] = redact(v);
    }
    return out;
  }
  return value;
}

function summarize(value) {
  if (Array.isArray(value)) return `array[${value.length}]` + (value.length && typeof value[0] === 'object' ? ` of {${Object.keys(value[0]).join(', ')}}` : '');
  if (value && typeof value === 'object') return `object {${Object.keys(value).join(', ')}}`;
  return typeof value;
}

async function main() {
  const timeRes = await fetch(`${ENDPOINT}/auth/time`);
  if (!timeRes.ok) die(`cannot reach ${ENDPOINT}/auth/time (HTTP ${timeRes.status})`);
  const delta = Number(await timeRes.text()) - Math.floor(Date.now() / 1000);

  const url = ENDPOINT + PATH;
  const ts = String(Math.floor(Date.now() / 1000) + delta);
  const sig = '$1$' + createHash('sha1').update([AS, CK, METHOD, url, BODY, ts].join('+')).digest('hex');

  const res = await fetch(url, {
    method: METHOD,
    headers: {
      'Content-Type': 'application/json',
      'X-Ovh-Application': AK,
      'X-Ovh-Consumer': CK,
      'X-Ovh-Timestamp': ts,
      'X-Ovh-Signature': sig,
    },
    body: BODY || undefined,
  });

  const text = await res.text();
  let data; try { data = text ? JSON.parse(text) : null; } catch { data = text; }

  console.log(`${METHOD} ${PATH} → HTTP ${res.status}`);
  if (!res.ok) {
    const msg = data && data.message ? data.message : text;
    if (res.status === 401) console.error('  → 401: signature/identifiants refusés — vérifie les 3 secrets (et l\'endpoint eu/ca).');
    if (res.status === 403) console.error(`  → 403: le jeton n'a pas le droit ${METHOD} sur ${PATH}. Ajoute ce droit sur createToken (ou recrée le jeton avec un chemin plus large).`);
    if (res.status === 404) console.error('  → 404: chemin inconnu ou ressource inexistante.');
    console.error(`  ${msg}`);
    process.exit(2);
  }
  if (QUIET) { console.log(`  ${summarize(data)}`); return; }
  console.log(JSON.stringify(redact(data), null, 2));
}

main().catch(e => die(e.message));
