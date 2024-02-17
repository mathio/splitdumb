export const typeDefs = `
  scalar Date
  type Query {
    groups: [Group]
    group(id: Int!): GroupDetails
  }
  type Mutation {
    createGroup(title: String!): GroupDetails
    updateGroup(id: ID!, title: String!): GroupDetails
    createPayment(sum: Float!, groupId: Int!, senderId: Int!, receiverId: Int!): Payment
    updatePayment(id: Int!, sum: Float!, groupId: Int!, senderId: Int!, receiverId: Int!): Payment
    deletePayment(id: Int!): PaymentId
  }
  type PaymentId {
    id: ID!
    groupId: Int!
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
    totals: [UserTotal]
    transactions: [Transaction]
    members: [User]
  }
  type Transaction {
    id: ID!
    user: User!
    from: [TransactionDetails]
    to: [TransactionDetails]
  }
  type TransactionDetails {
    id: ID!
    user: User!
    sum: Float!
  }
  type UserTotal {
    id: ID!
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
