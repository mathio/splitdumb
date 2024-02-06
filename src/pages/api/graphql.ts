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

        return {
          ...group,
          feed: [...expenses, ...payments].sort(sortBy("createdAt", true)),
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
