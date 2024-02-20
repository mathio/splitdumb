import { Decimal } from "decimal.js";

export const buildGroupTotals = (
  expenses: any[],
  payments: any[],
  users: any[],
): Record<number, { user: any; sum: Decimal }> => {
  const expenseBalances = expenses.flatMap((expense) => [
    ...expense.payments,
    ...expense.debts,
  ]);
  const paymentBalances = payments.flatMap(({ sender, receiver, sum }) => [
    { user: sender, sum: new Decimal(sum) },
    { user: receiver, sum: new Decimal(sum).times(-1) },
  ]);

  const usersTotals = users.reduce((acc, user) => ({
    [user.id]: { id: user.id, user, sum: new Decimal(0) },
  }));

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
    usersTotals,
  );
};
