import prisma from "../prisma";

import { userIsMemberOfGroup } from "../group/user-is-member-of-group";

export const deleteExpense = async (_, { id }: { id: string }, { user }) => {
  const expense = await prisma.expense.findUnique({
    where: { id: Number(id) },
  });

  await userIsMemberOfGroup(user.id, expense.groupId);

  if (expense) {
    await prisma.expense.delete({
      where: { id: Number(id) },
    });
  }
  return { id, groupId: expense.groupId };
};
