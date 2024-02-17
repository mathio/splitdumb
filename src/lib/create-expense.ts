import prisma from "./prisma";
import { calculateDebts } from "./calculate-debts";

export const createExpense = async (
  _,
  {
    title,
    sum,
    paysUserId,
    groupId,
    split,
  }: {
    title: string;
    sum: string;
    paysUserId: string;
    groupId: string;
    split: string;
  },
) => {
  const { id } = await prisma.expense.create({
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
    where: { id },
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
