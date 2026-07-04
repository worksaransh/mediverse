import postgres from "postgres";

const projectRef = 'scmzwdrmfzfkilflrvdz';
const password = 'hW1hdiMllF9Z9ClS'; // standard placeholder password
const regions = [
  'ap-south-1',
  'ap-southeast-1',
  'ap-southeast-2',
  'ap-northeast-1',
  'ap-northeast-2',
  'us-east-1',
  'us-east-2',
  'us-west-1',
  'us-west-2',
  'eu-central-1',
  'eu-west-1',
  'eu-west-2',
  'eu-west-3',
  'sa-east-1',
  'ca-central-1',
  'me-central-1',
  'af-south-1',
  'ap-south-2',
  'ap-east-1',
  'eu-north-1',
  'eu-south-1'
];

async function checkRegion(region: string) {
  const host = `aws-0-${region}.pooler.supabase.com`;
  const connectionString = `postgres://postgres.${projectRef}:${password}@${host}:6543/postgres`;

  const sql = postgres(connectionString, {
    timeout: 5,
    connect_timeout: 5,
  });

  try {
    await sql`SELECT 1`;
    console.log(`[SUCCESS] Connected to ${region} on ${host}!`);
    await sql.end();
    return { region, status: 'success' };
  } catch (err: any) {
    await sql.end();
    if (err.message.includes('password authentication failed') || err.message.includes('authentication failed')) {
      console.log(`[FOUND] Tenant found in ${region} (${host}), password rejected.`);
      return { region, status: 'found_auth_fail' };
    } else if (err.message.includes('tenant/user') && err.message.includes('not found')) {
      // tenant not found, skip
    } else {
      console.log(`[ERROR] Region ${region} (${host}): ${err.message}`);
    }
    return { region, status: 'not_found' };
  }
}

async function run() {
  console.log(`Probing pooler hosts for project ref: ${projectRef}...`);
  for (const r of regions) {
    const res = await checkRegion(r);
    if (res.status === 'found_auth_fail' || res.status === 'success') {
      console.log(`\n🎉 Tenant resolved to region: ${r}!`);
      break;
    }
  }
  console.log('Probing complete.');
}

run().catch(console.error);
