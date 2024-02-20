import prisma from "../prisma";
import { calculateDebts } from "./calculate-debts";
import { getExpense } from "./get-expense";
import { userIsMemberOfGroup } from "../group/user-is-member-of-group";

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
  { user },
) => {
  await userIsMemberOfGroup(user.id, groupId);

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

  return getExpense(Number(id));
};
