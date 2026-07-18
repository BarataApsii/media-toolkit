const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function setAdminRole(email) {
  try {
    await prisma.$executeRaw`UPDATE "users" SET "role" = 'ADMIN' WHERE email = ${email}`;
    console.log(`Successfully set ${email} to ADMIN role`);
    
    const user = await prisma.$queryRaw`SELECT id, email, role FROM "users" WHERE email = ${email}`;
    console.log('Updated user:', user[0]);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

const email = process.argv[2];
if (!email) {
  console.error('Please provide an email: node scripts/set-admin-role.js <email>');
  process.exit(1);
}

setAdminRole(email);
