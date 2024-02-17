import prisma from "./prisma";
import { sortBy } from "./utils";

export const getExpenses = async (groupId: number) => {
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

export const getPayments = async (groupId: number) => {
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

export const getTransactions = async (
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

    if (lent.sum > owed.sum) {
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
      if (owed.sum > 0) {
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

export const getTotals = (
  expenses: any[],
): Record<number, { user: any; sum: number }> => {
  return expenses
    .flatMap((expense) => [...expense.payments, ...expense.debts])
    .reduce((totals, { user, sum }) => {
      totals[user.id] = totals[user.id] ?? { user, sum: 0 };
      totals[user.id].sum += Number(sum);
      return totals;
    }, {});
};

export const getUsers = (totals: Record<number, any>) => {
  return Object.values(totals).map(({ user }) => user);
};

export const getGroup = async (_, { id }) => {
  const group = await prisma.group.findUnique({
    where: { id },
    include: {
      user: true,
    },
  });

  const expenses = await getExpenses(id);
  const payments = await getPayments(id);
  const feed = [...expenses, ...payments].sort(sortBy("createdAt", true));

  const totals = getTotals(expenses);
  const users = getUsers(totals);

  return {
    ...group,
    users,
    feed,
    totals: Object.values(totals),
    transactions: getTransactions(totals, users),
  };
};
