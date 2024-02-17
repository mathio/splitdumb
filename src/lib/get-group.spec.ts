import { buildUsers, findExpenses, findGroup, findPayments } from "./get-group";
import { prismaMock } from "../../test/prisma-mock";
describe("findGroup", () => {
  it("should return a group object", async () => {
    const group: any = { id: 1 };
    prismaMock.group.findUnique.mockResolvedValue(group);
    expect(await findGroup(1)).toBe(group);
  });
});

describe("findExpenses", () => {
  it("should return a array of expenses", async () => {
    const expenses: any[] = [
      {
        id: 1,
        payments: [{ sum: 1 }, { sum: 2 }, { sum: 3 }],
      },
      {
        id: 2,
        payments: [{ sum: 10 }, { sum: 20 }, { sum: 5 }],
      },
    ];
    prismaMock.expense.findMany.mockResolvedValue(expenses);
    expect(await findExpenses(1)).toEqual([
      {
        id: 1,
        payments: [{ sum: 1 }, { sum: 2 }, { sum: 3 }],
        __typename: "Expense",
        sum: 6,
      },
      {
        id: 2,
        payments: [{ sum: 10 }, { sum: 20 }, { sum: 5 }],
        __typename: "Expense",
        sum: 35,
      },
    ]);
  });
});

describe("findPayments", () => {
  it("should return a array of payments", async () => {
    const payments: any[] = [{ id: 1 }, { id: 2 }];
    prismaMock.payment.findMany.mockResolvedValue(payments);
    expect(await findPayments(1)).toEqual([
      { id: 1, __typename: "Payment" },
      { id: 2, __typename: "Payment" },
    ]);
  });
});

describe("buildTotals", () => {
  // TODO
});

describe("buildUsers", () => {
  it("should return a array of users", async () => {
    const users = [{ id: 1 }, { id: 10 }, { id: 20 }];
    const totals: any = {
      1: { user: users[0], sum: 10 },
      2: { user: users[1], sum: 20 },
      3: { user: users[2], sum: 30 },
    };
    expect(await buildUsers(totals)).toEqual(users);
  });
});

describe("buildTransactions", () => {
  // TODO
});

describe("getGroup", () => {
  // TODO
});
