import type { NextApiRequest, NextApiResponse } from "next";
import { createSchema, createYoga } from "graphql-yoga";
import prisma from "../../lib/prisma";

export const config = {
  api: {
    bodyParser: false,
  },
};

const sortBy =
  (field: string, desc = false) =>
  (a: any, b: any) =>
    (a[field] - b[field]) * (desc ? -1 : 1);

const schema: any = createSchema({
  typeDefs: `
    scalar Date
    type Query {
      groups: [Group]
      group(id: Int!): GroupDetails
    }
    type Group {
      id: ID!
      createdAt: Date!
      updatedAt: Date!
      title: String!
    }
    type GroupDetails {
      id: ID!
      createdAt: Date!
      updatedAt: Date!
      title: String!
      user: User!
      feed: [FeedItem]
      expenses: [Expense]
      payments: [Payment]
      totals: [UserTotal]
      transactions: [Transaction]
      users: [User]
    }
    type Transaction {
      user: User!
      from: [TransactionDetails]
      to: [TransactionDetails]
    }
    type TransactionDetails {
      user: User!
      sum: Float!
    }
    type UserTotal {
      sum: Float!
      user: User!
    }
    type User {
      id: ID!
      name: String!
      email: String!
      image: String!
    }
    interface FeedItem {
      id: ID!
      createdAt: Date!
      updatedAt: Date!
      type: String!
    }
    type Expense implements FeedItem {
      id: ID!
      createdAt: Date!
      updatedAt: Date!
      type: String!
      title: String!
      sum: Float!
      user: User!
      payments: [Balance]!
      debts: [Balance]!
    }
    type Balance {
      id: ID!
      sum: Float!
      user: User
    }
    type Payment implements FeedItem {
      id: ID!
      createdAt: Date!
      updatedAt: Date!
      type: String!
      sender: User!
      receiver: User!
      sum: Float!
    }
  `,
  resolvers: {
    Query: {
      groups: async () => {
        return prisma.group.findMany();
      },
      group: async (_, { id }) => {
        const group = await prisma.group.findUnique({
          where: { id },
          include: {
            user: true,
          },
        });

        const expenses = (
          await prisma.expense.findMany({
            where: { groupId: id },
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

        const payments = (
          await prisma.payment.findMany({
            where: { groupId: id },
            include: {
              sender: true,
              receiver: true,
            },
          })
        ).map((e) => ({ ...e, __typename: "Payment" }));

        const totals: Record<number, { user: any; sum: number }> = expenses
          .flatMap((expense) => [...expense.payments, ...expense.debts])
          .reduce((totals, { user, sum }) => {
            totals[user.id] = totals[user.id] ?? { user, sum: 0 };
            totals[user.id].sum += Number(sum);
            return totals;
          }, {});

        const users = Object.values(totals).map(({ user }) => user);

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

        const transactions = users.map((user) => ({
          user,
          from: allTransactions
            .filter((t) => t.to.id === user.id)
            .map(({ from, sum }) => ({ user: from, sum })),
          to: allTransactions
            .filter((t) => t.from.id === user.id)
            .map(({ to, sum }) => ({ user: to, sum })),
        }));

        return {
          ...group,
          feed: [...expenses, ...payments].sort(sortBy("createdAt", true)),
          totals: Object.values(totals),
          transactions,
          users,
        };
      },
    },
  },
});

export default createYoga<{
  req: NextApiRequest;
  res: NextApiResponse;
}>({
  schema,
  graphqlEndpoint: "/api/graphql",
});
