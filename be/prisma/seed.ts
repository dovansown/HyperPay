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

  const durations = [
    { name: "1 tháng", months: 1, days: 30, sortOrder: 1 },
    { name: "3 tháng", months: 3, days: 90, sortOrder: 2 },
    { name: "6 tháng", months: 6, days: 180, sortOrder: 3 },
    { name: "12 tháng", months: 12, days: 365, sortOrder: 4 }
  ];
  for (const d of durations) {
    const existing = await prisma.duration.findFirst({ where: { months: d.months, deletedAt: null } });
    if (existing) {
      await prisma.duration.update({
        where: { id: existing.id },
        data: { name: d.name, days: d.days, sortOrder: d.sortOrder }
      });
    } else {
      await prisma.duration.create({ data: d });
    }
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
