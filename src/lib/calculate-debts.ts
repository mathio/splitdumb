import { Decimal } from "decimal.js";

export const calculateDebts = (sum, split) => {
  const splitObj = JSON.parse(split);
  const debtors = Object.keys(splitObj).filter((key) => splitObj[key]);

  const debtSum = new Decimal(sum).dividedBy(debtors.length).toDecimalPlaces(2);
  const debtRemainder = new Decimal(sum).minus(
    new Decimal(debtSum).times(debtors.length),
  );
  const debts = debtors.map((key) => ({ sum: debtSum, userId: Number(key) }));
  debts[debts.length - 1].sum = debts[debts.length - 1].sum.add(debtRemainder);
  return debts
    .filter(({ sum }) => sum.gt(0))
    .map(({ sum, ...obj }) => ({ ...obj, sum: sum.times(-1).toNumber() }));
};
