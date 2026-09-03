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

// Models the matched routes mention: enums with their allowed values, and
// structures with their fields. A body parameter typed "hosting.web.user"
// tells you nothing until you can see what that contains — and guessing an
// enum value before a POST is how you get a 400 on a production host.
const mentioned = new Set();
for (const a of apis) for (const op of a.operations || []) {
  for (const p of op.parameters || []) if (p.dataType) mentioned.add(p.dataType.replace(/\[\]$/, ''));
  if (op.responseType) mentioned.add(op.responseType.replace(/\[\]$/, ''));
}
const models = Object.entries(schema.models || {}).filter(([name]) => mentioned.has(name));
if (models.length) {
  console.log(`\n${'─'.repeat(70)}\nmodèles cités par ces routes (${models.length})\n${'─'.repeat(70)}`);
  for (const [name, m] of models) {
    if (m.enum) { console.log(`\n${name} — valeurs autorisées :\n  ${m.enum.join(' · ')}`); continue; }
    const props = Object.entries(m.properties || {});
    if (!props.length) continue;
    console.log(`\n${name}${m.description ? ` — ${m.description}` : ''}`);
    for (const [k, p] of props) console.log(`  ${k}: ${p.type}${p.canBeNull ? '?' : ''}${p.readOnly ? ' (lecture seule)' : ''}${p.description ? ` — ${p.description}` : ''}`);
  }
}
