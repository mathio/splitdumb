import { Decimal } from "decimal.js";
import prisma from "./prisma";
import { sortBy } from "./utils";

export const findGroup = async (id: string) => {
  return prisma.group.findUnique({
    where: { id: Number(id) },
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

export const buildTotals = (
  expenses: any[],
  payments: any[],
): Record<number, { user: any; sum: Decimal }> => {
  const expenseBalances = expenses.flatMap((expense) => [
    ...expense.payments,
    ...expense.debts,
  ]);
  const paymentBalances = payments.flatMap(({ sender, receiver, sum }) => [
    { user: sender, sum: new Decimal(sum) },
    { user: receiver, sum: new Decimal(sum).times(-1) },
  ]);
  return [...expenseBalances, ...paymentBalances].reduce(
    (totals, { user, sum }) => {
      totals[user.id] = totals[user.id] ?? {
        id: user.id,
        user,
        sum: new Decimal(0),
      };
      totals[user.id].sum = totals[user.id].sum.add(sum);
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
    .filter((total) => total.sum.lt(0))
    .sort(sortBy("sum"));

  const totalsLent = totalsArray
    .filter((total) => total.sum.gt(0))
    .sort(sortBy("sum", true));

  const allTransactions = [];

  console.log(totalsArray);

  while (totalsOwed.length > 0 || totalsLent.length > 0) {
    const owed = totalsOwed.shift();
    const lent = totalsLent.shift();

    console.log({ owed, lent });

    let sum;
    if (Math.abs(lent.sum) > Math.abs(owed.sum)) {
      lent.sum = lent.sum.add(owed.sum);
      if (lent.sum > 0) {
        totalsLent.unshift(lent);
      }
      sum = owed.sum.toNumber();
    } else {
      owed.sum = owed.sum.add(lent.sum);
      if (owed.sum < 0) {
        totalsOwed.unshift(owed);
      }
      sum = lent.sum.toNumber();
    }

    console.log(`${owed.user.name} pays ${sum} to ${lent.user.name}`);

    allTransactions.push({
      from: owed.user,
      to: lent.user,
      sum,
    });
  }

  return users.map((user) => ({
    id: user.id,
    user,
    from: allTransactions
      .filter((t) => t.to.id === user.id)
      .map(({ from, sum }) => ({
        id: `${user.id}-${from.id}`,
        user: from,
        sum,
      })),
    to: allTransactions
      .filter((t) => t.from.id === user.id)
      .map(({ to, sum }) => ({ id: `${user.id}-${to.id}`, user: to, sum })),
  }));
};

export const getGroup = async (_, { id }: { id: string }) => {
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
    totals: Object.values(totals).map(({ sum, ...obj }) => ({
      ...obj,
      sum: sum.toNumber(),
    })),
    transactions: buildTransactions(totals, users),
  };
};
