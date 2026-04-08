// prisma.ts: import prismaclient and export for long running use
import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@prisma/client";

const host_name = String(process.env.DATABASE_HOST);
const user_name = String(process.env.DATABASE_USER);
const password = String(process.env.DATABASE_PASSWORD);
const db_name = String(process.env.DATABASE_NAME);
const port = Number(process.env.DATABASE_PORT)

const adapter = new PrismaMariaDb({
  host: host_name,
  user: user_name,
  port: port,
  password: password,
  database: db_name,
  allowPublicKeyRetrieval: true,   
  ssl: false,
});

const prisma = new PrismaClient({ adapter });
export { prisma };
