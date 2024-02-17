export const typeDefs = `
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
`;
