import prisma from "./prisma";
import { calculateDebts } from "./calculate-debts";

export const updateExpense = async (
  _,
  {
    id,
    title,
    sum,
    paysUserId,
    groupId,
    split,
  }: {
    id: string;
    title: string;
    sum: number;
    paysUserId: string;
    groupId: string;
    split: string;
  },
) => {
  await prisma.balance.deleteMany({
    where: { expenseId: Number(id) },
  });

  await prisma.expense.update({
    where: { id: Number(id) },
    data: {
      title,
      group: { connect: { id: Number(groupId) } },
      user: { connect: { id: Number(paysUserId) } },
      payments: {
        createMany: {
          data: [{ sum, userId: Number(paysUserId) }],
        },
      },
      debts: {
        createMany: {
          data: calculateDebts(sum, split),
        },
      },
    },
  });

  await prisma.group.update({
    where: { id: Number(groupId) },
    data: {
      updatedAt: new Date(),
    },
  });

  return prisma.expense.findUnique({
    where: { id: Number(id) },
    include: {
      payments: {
        include: {
          user: true,
        },
        where: {
          sum: { gt: 0 },
        },
      },
      debts: {
        include: {
          user: true,
        },
        where: {
          sum: { lte: 0 },
        },
      },
      user: true,
    },
  });
};
