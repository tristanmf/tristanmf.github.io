// Browse the OVHcloud API schema (public, no credentials) — Node built-ins only.
//
//   node scripts/ovh-schema.mjs <api> [filter-regex]
//
//   node scripts/ovh-schema.mjs /hosting/web 'ssl|certificate'
//   node scripts/ovh-schema.mjs /domain/zone redirection
//   node scripts/ovh-schema.mjs /hosting/web '/user$'
//
// Prints every route whose path matches the filter, one line per method
// (METHOD path — description), and for POST/PUT the body parameters with
// their type. The schema lives at <endpoint>/<api>.json, e.g.
// https://eu.api.ovh.com/1.0/hosting/web.json — reachable from the GitHub
// runner, not from the Claude sandbox.

const ENDPOINT = (process.env.OVH_ENDPOINT || 'https://eu.api.ovh.com/1.0').replace(/\/$/, '');
const api = (process.argv[2] || '').trim().replace(/\/$/, '');
const filter = process.argv[3] ? new RegExp(process.argv[3], 'i') : null;
if (!api.startsWith('/')) { console.error('✗ usage: ovh-schema.mjs </api> [filter-regex]   e.g. /hosting/web ssl'); process.exit(1); }

const url = `${ENDPOINT}${api}.json`;
const res = await fetch(url);
if (!res.ok) { console.error(`✗ ${url} → HTTP ${res.status}`); process.exit(2); }
const schema = await res.json();

const apis = (schema.apis || []).filter((a) => !filter || filter.test(a.path));
console.log(`${apis.length} route(s) in ${api}${filter ? ` matching /${filter.source}/i` : ''}  (schema ${url})\n`);
for (const a of apis) {
  for (const op of a.operations || []) {
    const status = op.apiStatus && op.apiStatus.value && op.apiStatus.value !== 'PRODUCTION' ? ` [${op.apiStatus.value}]` : '';
    console.log(`${op.httpMethod.padEnd(6)} ${a.path}${status} — ${op.description || ''}`);
    if (/^(POST|PUT)$/.test(op.httpMethod)) {
      const body = (op.parameters || []).filter((p) => p.paramType === 'body');
      const query = (op.parameters || []).filter((p) => p.paramType === 'query');
      for (const p of body) console.log(`         · ${p.name}: ${p.dataType}${p.required ? '' : '?'}${p.description ? ` — ${p.description}` : ''}`);
      for (const p of query) console.log(`         ? ${p.name}: ${p.dataType}${p.required ? '' : '?'}${p.description ? ` — ${p.description}` : ''}`);
    } else {
      const query = (op.parameters || []).filter((p) => p.paramType === 'query');
      for (const p of query) console.log(`         ? ${p.name}: ${p.dataType}${p.required ? '' : '?'}${p.description ? ` — ${p.description}` : ''}`);
    }
  }
}
