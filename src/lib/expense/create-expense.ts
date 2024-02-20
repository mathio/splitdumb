import prisma from "../prisma";
import { calculateDebts } from "./calculate-debts";
import { getExpense } from "./get-expense";
import { userIsMemberOfGroup } from "../group/user-is-member-of-group";

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
  { user },
) => {
  await userIsMemberOfGroup(user.id, groupId);

  const { id } = await prisma.expense.create({
    data: {
      title,
      group: { connect: { id: Number(groupId) } },
      user: { connect: { id: user.id } },
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

  return getExpense(id);
};
