// Shared OVHcloud API client (Node built-ins only). Used by
//   scripts/ovh-api.mjs          — one arbitrary call
//   scripts/ovh-zone-report.mjs  — full picture of a zone + hostings
//
// Credentials from the environment: OVH_APP_KEY, OVH_APP_SECRET,
// OVH_CONSUMER_KEY, optional OVH_ENDPOINT (default https://eu.api.ovh.com/1.0).
//
// Signature (OVH "$1$" scheme): SHA1 hex of
//   APP_SECRET+"+"+CONSUMER_KEY+"+"+METHOD+"+"+FULL_URL+"+"+BODY+"+"+TIMESTAMP
// with TIMESTAMP corrected by the server/client clock delta (GET /auth/time).

import { createHash } from 'node:crypto';

// Keys whose values must never reach a (public) Actions log.
export const SENSITIVE = /^(email|phone|fax|address|line1|line2|city|zip|firstname|lastname|name|legalform|nichandle|vat|birthDay|birthCity|nationalIdentificationNumber|authInfo|password|secret|token|consumerKey|applicationKey|applicationSecret|primaryLogin|login|ftpUser)$/i;

// OVH customer identifiers ("nichandles", e.g. ab12345-ovh) show up under
// generic keys such as contactBilling.id or ovh:whoisOwner — mask by shape.
const NICHANDLE = /^[a-z]{2,}\d+-ovh$/i;

export function redact(value) {
  if (Array.isArray(value)) return value.map(redact);
  if (value && typeof value === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      const scalar = typeof v === 'string' || typeof v === 'number';
      if (scalar && (SENSITIVE.test(k) || NICHANDLE.test(String(v)))) {
        if (String(v).length) console.log(`::add-mask::${v}`);
        out[k] = '«masqué»';
      } else out[k] = redact(v);
    }
    return out;
  }
  if (typeof value === 'string' && NICHANDLE.test(value)) { console.log(`::add-mask::${value}`); return '«masqué»'; }
  return value;
}

export function summarize(value) {
  if (Array.isArray(value)) return `array[${value.length}]` + (value.length && value[0] && typeof value[0] === 'object' ? ` of {${Object.keys(value[0]).join(', ')}}` : '');
  if (value && typeof value === 'object') return `object {${Object.keys(value).join(', ')}}`;
  return typeof value;
}

export function explainStatus(status, method, path) {
  if (status === 401) return '401 : signature/identifiants refusés — vérifie les 3 secrets (et l\'endpoint eu/ca).';
  if (status === 403) return `403 : le jeton n'a pas le droit ${method} sur ${path} — ajoute ce droit sur createToken (ou recrée le jeton avec un chemin plus large).`;
  if (status === 404) return '404 : chemin inconnu ou ressource inexistante.';
  return '';
}

export class OvhError extends Error {
  constructor(method, path, status, data) {
    const msg = data && typeof data === 'object' && data.message ? data.message : (typeof data === 'string' ? data : '');
    super(`${method} ${path} → HTTP ${status}${msg ? `: ${msg}` : ''}`);
    this.status = status; this.data = data; this.method = method; this.path = path;
  }
}

/** Build a signed `call(method, path, body?)` function. Throws if credentials are missing. */
export async function ovhClient(env = process.env) {
  const ENDPOINT = (env.OVH_ENDPOINT || 'https://eu.api.ovh.com/1.0').replace(/\/$/, '');
  const AK = env.OVH_APP_KEY, AS = env.OVH_APP_SECRET, CK = env.OVH_CONSUMER_KEY;
  if (!AK || !AS || !CK) throw new Error('missing OVH_APP_KEY / OVH_APP_SECRET / OVH_CONSUMER_KEY in the environment (GitHub → Settings → Secrets → Actions)');

  const timeRes = await fetch(`${ENDPOINT}/auth/time`);
  if (!timeRes.ok) throw new Error(`cannot reach ${ENDPOINT}/auth/time (HTTP ${timeRes.status})`);
  const delta = Number(await timeRes.text()) - Math.floor(Date.now() / 1000);

  return async function call(method, path, body) {
    if (!/^(GET|POST|PUT|DELETE)$/.test(method)) throw new Error(`unsupported method ${method}`);
    if (!path.startsWith('/')) throw new Error('path must start with "/"');
    const url = ENDPOINT + path;
    const payload = body == null || body === '' ? '' : (typeof body === 'string' ? body : JSON.stringify(body));
    const ts = String(Math.floor(Date.now() / 1000) + delta);
    const sig = '$1$' + createHash('sha1').update([AS, CK, method, url, payload, ts].join('+')).digest('hex');
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', 'X-Ovh-Application': AK, 'X-Ovh-Consumer': CK, 'X-Ovh-Timestamp': ts, 'X-Ovh-Signature': sig },
      body: payload || undefined,
    });
    const text = await res.text();
    let data; try { data = text ? JSON.parse(text) : null; } catch { data = text; }
    if (!res.ok) throw new OvhError(method, path, res.status, data);
    return data;
  };
}
