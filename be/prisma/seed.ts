import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const banks = [
    { name: "Vietcombank", code: "VCB", iconUrl: "" },
    { name: "VietinBank", code: "CTG", iconUrl: "" },
    { name: "BIDV", code: "BIDV", iconUrl: "" }
  ];

  for (const bank of banks) {
    await prisma.bank.upsert({
      where: { code: bank.code },
      update: bank,
      create: bank
    });
  }

  await prisma.plan.upsert({
    where: { name: "Starter" },
    update: {
      priceVnd: BigInt(99000),
      maxBankAccounts: 1,
      maxTransactions: 1000,
      durationDays: 30,
      description: "Goi co ban cho merchant moi."
    },
    create: {
      name: "Starter",
      priceVnd: BigInt(99000),
      maxBankAccounts: 1,
      maxTransactions: 1000,
      durationDays: 30,
      description: "Goi co ban cho merchant moi."
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
