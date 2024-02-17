import prisma from "./prisma";

export const deleteExpense = async (_, { id }: { id: string }) => {
  const expense = await prisma.expense.findUnique({
    where: { id: Number(id) },
  });

  if (expense) {
    await prisma.expense.delete({
      where: { id: Number(id) },
    });
  }
  return { id, groupId: expense.groupId };
};
