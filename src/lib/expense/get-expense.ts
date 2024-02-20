import prisma from "../prisma";

export const getExpense = (id: number) => {
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
