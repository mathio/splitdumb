import prisma from "./prisma";
import { sortBy } from "./utils";

export const findGroup = async (id: number) => {
  return prisma.group.findUnique({
    where: { id },
    include: {
      user: true,
    },
  });
};

export const findExpenses = async (groupId: number) => {
  return (
    await prisma.expense.findMany({
      where: { groupId },
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

export const findPayments = async (groupId: number) => {
  return (
    await prisma.payment.findMany({
      where: { groupId },
      include: {
        sender: true,
        receiver: true,
      },
    })
  ).map((e) => ({ ...e, __typename: "Payment" }));
};

export const buildTotals = (
  expenses: any[],
  payments: any[],
): Record<number, { user: any; sum: number }> => {
  const expenseBalances = expenses.flatMap((expense) => [
    ...expense.payments,
    ...expense.debts,
  ]);
  const paymentBalances = payments.flatMap(({ sender, receiver, sum }) => [
    { user: sender, sum },
    { user: receiver, sum: sum * -1 },
  ]);
  return [...expenseBalances, ...paymentBalances].reduce(
    (totals, { user, sum }) => {
      totals[user.id] = totals[user.id] ?? { user, sum: 0 };
      totals[user.id].sum += Number(sum);
      return totals;
    },
    {},
  );
};

export const buildUsers = (totals: Record<number, any>) => {
  return Object.values(totals).map(({ user }) => user);
};

export const buildTransactions = async (
  totals: Record<number, any>,
  users: any[],
) => {
  const totalsArray = [...Object.values(totals)].map((obj) => ({
    ...obj,
  }));

  const totalsOwed = totalsArray
    .filter((total) => total.sum < 0)
    .sort(sortBy("sum"));

  const totalsLent = totalsArray
    .filter((total) => total.sum > 0)
    .sort(sortBy("sum", true));

  const allTransactions = [];

  while (totalsOwed.length > 0 || totalsLent.length > 0) {
    const owed = totalsOwed.shift();
    const lent = totalsLent.shift();

    if (Math.abs(lent.sum) > Math.abs(owed.sum)) {
      lent.sum += owed.sum;
      if (lent.sum > 0) {
        totalsLent.unshift(lent);
      }
      allTransactions.push({
        from: owed.user,
        to: lent.user,
        sum: owed.sum,
      });
    } else {
      owed.sum += lent.sum;
      if (owed.sum < 0) {
        totalsOwed.unshift(owed);
      }
      allTransactions.push({
        from: owed.user,
        to: lent.user,
        sum: lent.sum,
      });
    }
  }

  return users.map((user) => ({
    user,
    from: allTransactions
      .filter((t) => t.to.id === user.id)
      .map(({ from, sum }) => ({ user: from, sum })),
    to: allTransactions
      .filter((t) => t.from.id === user.id)
      .map(({ to, sum }) => ({ user: to, sum })),
  }));
};

export const getGroup = async (_, { id }) => {
  const group = await findGroup(id);

  const expenses = await findExpenses(id);
  const payments = await findPayments(id);
  const feed = [...expenses, ...payments].sort(sortBy("createdAt", true));

  const totals = buildTotals(expenses, payments);
  const users = buildUsers(totals);

  return {
    ...group,
    users,
    feed,
    totals: Object.values(totals),
    transactions: buildTransactions(totals, users),
  };
};
