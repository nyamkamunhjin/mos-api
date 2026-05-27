// Seed members to Strapi Cloud via REST API
// Usage: STRAPI_API_TOKEN=<token> node scripts/seed-members.mjs
// Or: STRAPI_API_TOKEN=<token> node scripts/seed-members.mjs --force

const STRAPI_URL = process.env.STRAPI_URL || 'https://glowing-courage-84353f7410.strapiapp.com';
const TOKEN = process.env.STRAPI_API_TOKEN;

if (!TOKEN) {
  console.error('STRAPI_API_TOKEN env var required');
  process.exit(1);
}

const members = [
  {
    name: "Dr. S. Gombobaatar",
    title: "Founder & Director",
    role: "Founder",
    bio: "One of the founders of the Society in 1999. Since then, he has been extensively dealing with activities on bird research, conservation, and international collaborations for the Society. He is also head of the Laboratory of Ornithology at the National University of Mongolia. Gomboo wrote his master thesis on Cranes of Mongolia in 1996 and Ph.D. thesis on Saker Falcon in Mongolia in 2006. He has been supervising and coordinating all projects and research works of the Society, and supervising theses of B.Sc., MSc., Ph.D students at his Laboratory.",
    group: "leadership",
    sortOrder: 0,
  },
  {
    name: "Ch. Uuganbayar MSc.",
    title: "Board Member",
    role: "Board Member",
    bio: "One of the pioneer members of the society. His bachelor and master thesis were written on the diet composition of Sakers in Central Mongolia. Since 2002, Uugan has been working at the Biology Department of Mongolian State University of Agriculture. He successfully organized several birding and ornithological expeditions in Eastern Mongolia.",
    group: "board",
    sortOrder: 0,
  },
  {
    name: "D. Usukhjargal MSc.",
    title: "Board Member",
    role: "Board Member",
    bio: "He has been working at Hustai Nuruu National Park as a Takhi biologist since 2003. He is one of the experts on birds in the areas. He completed his master thesis on Reed Deer in Hustai Nuruu National Park. Now he is studying doctorate training at the National University of Mongolia.",
    group: "board",
    sortOrder: 1,
  },
  {
    name: "P. Amartuvshin MSc.",
    title: "Board Member",
    role: "Board Member",
    bio: "He is one of the researchers of the Society. Amaraa wrote his master thesis on Impacts of power lines on bird mortality in 2010. He has participated in research projects on Regional Red List of Birds, risk assessments of high power electric lines, and Important Bird Areas surveys. He has been guiding the Society's birding tours since 2009.",
    group: "board",
    sortOrder: 2,
  },
  {
    name: "B. Odkhuu MSc.",
    title: "Ornithologist",
    role: "Researcher",
    bio: "Ornithologist at Chinggis Khaan International Airport, working to reduce bird and aircraft strike hazards since 2008. He wrote his bachelor thesis on Saker falcon's sex and age identification and master thesis on biological surveys of upland buzzard. He is interested in studying urban birds and raptors.",
    group: "other",
    sortOrder: 0,
  },
  {
    name: "B. Gantulga Dr.",
    title: "Researcher",
    role: "Researcher",
    bio: "Received his bachelor and master degree from the National University of Mongolia. His master thesis was on breeding success of Azure-winged magpie. He has been a member of the Mongolian Ornithological Society since 2005 and is well experienced in field study and birding.",
    group: "other",
    sortOrder: 1,
  },
  {
    name: "O. Soronzonbold MSc.",
    title: "Young Member",
    role: "Researcher",
    bio: "One of the young members of the society. He participates in Pallas's fish eagle and Saker surveys, helps organise conferences and workshops. He's interested in studying conservation genetics and biology of birds and wildlife in Mongolia.",
    group: "other",
    sortOrder: 2,
  },
  {
    name: "B. Yumjirmaa",
    title: "Member",
    role: "Researcher",
    bio: "Graduated from the National University of Mongolia majoring in Ecology and Nature Conservation. She has been a member of the Society since 2009 and has actively participated in conferences, workshops and birding trips.",
    group: "other",
    sortOrder: 3,
  },
  {
    name: "U. Tuvshin",
    title: "Researcher",
    role: "Researcher",
    bio: "Graduated from Eco-Asia Institute's Ecology & Conservation class. His research work includes observation of birds in the Avian Influenza Mongolia Project, Great Bustard's migration, and water birds migration studies.",
    group: "other",
    sortOrder: 4,
  },
  {
    name: "E. Unurjargal",
    title: "Young Member",
    role: "Researcher",
    bio: "One of the young members of the society. She graduated from the National University of Mongolia's Ecotourism Management class. She participates in bird watching tours and helps organize conferences and workshops.",
    group: "other",
    sortOrder: 5,
  },
];

async function main() {
  // Check existing count
  const existing = await fetch(`${STRAPI_URL}/api/members`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
  });
  const existingData = await existing.json();
  const count = existingData?.meta?.pagination?.total ?? 0;

  if (count > 0 && !process.argv.includes('--force')) {
    console.log(`Already ${count} members. Use --force to re-seed.`);
    process.exit(0);
  }

  if (count > 0 && process.argv.includes('--force')) {
    console.log(`Clearing ${count} existing members...`);
    for (const m of existingData.data) {
      await fetch(`${STRAPI_URL}/api/members/${m.documentId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${TOKEN}` },
      });
    }
  }

  for (const member of members) {
    const res = await fetch(`${STRAPI_URL}/api/members`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TOKEN}`,
      },
      body: JSON.stringify({ data: member }),
    });
    const body = await res.json();
    if (res.ok) {
      console.log(`  ✓ ${member.name}`);
    } else {
      console.error(`  ✗ ${member.name}: ${JSON.stringify(body.error || body)}`);
    }
  }
  console.log(`\nSeeded ${members.length} members`);
}

main().catch(console.error);
