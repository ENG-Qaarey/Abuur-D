// Writes the Prisma data model to src/access/datamodel.json.
// src/access/scope.ts reads it instead of Prisma.dmmf, which isn't available on Cloudflare Workers.
// Runs after `prisma generate` (see the "generate" script in package.json).
const fs = require('fs');
const path = require('path');
const { Prisma } = require('@prisma/client');

const models = Prisma.dmmf.datamodel.models.map((m) => ({
  name: m.name,
  fields: m.fields.map((f) => ({
    name: f.name,
    kind: f.kind,
    type: f.type,
    isList: f.isList,
    isRequired: f.isRequired,
    isId: f.isId,
    isUnique: f.isUnique,
    hasDefaultValue: f.hasDefaultValue,
    isUpdatedAt: f.isUpdatedAt,
    relationName: f.relationName,
    relationFromFields: f.relationFromFields,
    relationToFields: f.relationToFields,
  })),
}));
const out = path.join(__dirname, '..', 'src', 'access', 'datamodel.json');
fs.writeFileSync(out, JSON.stringify({ models }, null, 0) + '\n');
console.log(`datamodel.json: ${models.length} models`);
