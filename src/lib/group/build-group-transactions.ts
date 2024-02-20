import { sortBy } from "../utils/array";

export const buildGroupTransactions = async (
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
