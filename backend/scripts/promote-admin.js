// This script uses direct SQL to promote a user to admin
// Run with: npm run promote-admin <email>

const email = process.argv[2];

if (!email) {
  console.error('Please provide an email address: npm run promote-admin <email>');
  process.exit(1);
}

console.log(`To promote ${email} to ADMIN role, run this SQL in your PostgreSQL database:`);
console.log('');
console.log(`UPDATE "users" SET "role" = 'ADMIN' WHERE email = '${email}';`);
console.log('');
console.log('Or use psql:');
console.log(`psql -d media_db -c "UPDATE \\"users\\" SET \\"role\\" = 'ADMIN' WHERE email = '${email}';"`);

