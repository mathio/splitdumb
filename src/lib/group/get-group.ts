import prisma from "../prisma";
import { sortBy } from "../utils/array";
import { GraphQLError } from "graphql/index";
import { buildGroupTotals } from "./build-group-totals";
import { buildGroupTransactions } from "./build-group-transactions";

export const findGroup = async (id: string, userId: number) => {
  return prisma.group.findUnique({
    where: {
      id: Number(id),
      members: { some: { id: userId } },
    },
    include: {
      user: true,
      members: true,
    },
  });
};

export const findExpenses = async (groupId: string) => {
  return (
    await prisma.expense.findMany({
      where: { groupId: Number(groupId) },
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
    })
  ).map((e) => ({
    ...e,
    __typename: "Expense",
    sum: e.payments
      .map((payment) => Number(payment.sum))
      .reduce((total, sum) => total + sum, 0),
  }));
};

export const findPayments = async (groupId: string) => {
  return (
    await prisma.payment.findMany({
      where: { groupId: Number(groupId) },
      include: {
        sender: true,
        receiver: true,
      },
    })
  ).map((e) => ({ ...e, __typename: "Payment" }));
};

export const getGroup = async (_, { id }: { id: string }, { user }) => {
  const group = await findGroup(id, user.id);

  if (!group) {
    throw new GraphQLError("Not found");
  }

  const expenses = await findExpenses(id);
  const payments = await findPayments(id);
  const feed = [...expenses, ...payments].sort(sortBy("createdAt", true));

  const totals = buildGroupTotals(expenses, payments, group.members);

  return {
    ...group,
    feed,
    totals: Object.values(totals).map(({ sum, ...obj }) => ({
      ...obj,
      sum: sum.toNumber(),
    })),
    transactions: buildGroupTransactions(totals, group.members),
  };
};
