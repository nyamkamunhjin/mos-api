// Upload member images to Strapi Cloud and link to member entries
// Usage: STRAPI_API_TOKEN=<token> node scripts/upload-member-images.mjs

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const STRAPI_URL = process.env.STRAPI_URL || 'https://glowing-courage-84353f7410.strapiapp.com';
const TOKEN = process.env.STRAPI_API_TOKEN;

if (!TOKEN) {
  console.error('STRAPI_API_TOKEN env var required');
  process.exit(1);
}

const FRONTEND_PUBLIC = resolve(__dirname, '../../mos-frontend/public');

// Map member name → image file (relative to FRONTEND_PUBLIC)
const imageMap = [
  { name: 'Dr. S. Gombobaatar', file: 'Gombobaatar.JPG' },
  { name: 'Ch. Uuganbayar MSc.', file: 'members/Uuganbayar_Last.jpg' },
  { name: 'D. Usukhjargal MSc.', file: 'members/Usukhuu.jpg' },
  { name: 'B. Yumjirmaa', file: 'members/yuki.jpg' },
  { name: 'U. Tuvshin', file: 'members/tuvshin.jpg' },
];

async function getMembers() {
  const res = await fetch(`${STRAPI_URL}/api/members?pagination[pageSize]=100`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
  });
  const data = await res.json();
  return data.data;
}

async function uploadImage(filePath, fileName) {
  const buffer = readFileSync(filePath);
  const blob = new Blob([buffer], { type: 'image/jpeg' });
  const form = new FormData();
  form.append('files', blob, fileName);

  const res = await fetch(`${STRAPI_URL}/api/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}` },
    body: form,
  });
  const body = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(body.error || body));
  return body[0]; // returns array of uploaded file objects
}

async function linkImageToMember(documentId, fileId) {
  const res = await fetch(`${STRAPI_URL}/api/members/${documentId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TOKEN}`,
    },
    body: JSON.stringify({ data: { image: fileId } }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(body.error || body));
  return body;
}

async function main() {
  const members = await getMembers();
  console.log(`Found ${members.length} members in Strapi\n`);

  for (const { name, file } of imageMap) {
    const member = members.find((m) => m.name === name);
    if (!member) {
      console.warn(`  ! Member not found: ${name}`);
      continue;
    }

    const filePath = resolve(FRONTEND_PUBLIC, file);
    const fileName = file.split('/').pop();

    try {
      readFileSync(filePath);
    } catch {
      console.warn(`  ! File not found: ${filePath}`);
      continue;
    }

    try {
      console.log(`  Uploading ${fileName} → ${name}...`);
      const uploaded = await uploadImage(filePath, fileName);
      console.log(`  ✓ Uploaded (id: ${uploaded.id})`);

      await linkImageToMember(member.documentId, uploaded.id);
      console.log(`  ✓ Linked to ${name}\n`);
    } catch (err) {
      console.error(`  ✗ ${name}: ${err.message}\n`);
    }
  }

  console.log('Done');
}

main().catch(console.error);
