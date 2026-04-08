import dotenv from "dotenv";
dotenv.config();

const { prisma } = await import("../lib/prisma.js");

async function main() {
  const allUsers = await prisma.user.findMany();
  console.log(allUsers);
  console.log("Successful Connection")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());