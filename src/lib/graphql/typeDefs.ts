export const typeDefs = `
  scalar Date
  scalar JSON
  type Query {
    me: Profile
    groups: [GroupItem]
    group(id: String!): Group
    friends: [User]
  }
  type Mutation {
    updateProfile(name: String!, emails: [String!], primaryEmail: String): Profile!
    linkEmail(token: String!): Profile!
    createGroup(title: String!, groupFriends: JSON!): Group
    updateGroup(id: ID!, title: String!): Group
    deleteGroup(id: String!): GroupId
    createExpense(title: String!, sum: Float!, paysUserId: String!, groupId: String!, split: JSON!): Expense
    updateExpense(id: ID!, title: String!, sum: Float!, paysUserId: String!, groupId: String!, split: JSON!): Expense
    deleteExpense(id: ID!): ExpenseId
    createPayment(sum: Float!, groupId: String!, senderId: String!, receiverId: String!): Payment
    updatePayment(id: ID!, sum: Float!, groupId: String!, senderId: String!, receiverId: String!): Payment
    deletePayment(id: ID!): PaymentId
    addFriend(name: String!, email: String!): User
  }
  type Profile {
    id: ID!
    name: String!
    email: String!
    image: String!
    emails: [ProfileEmail!]
  }
  type ProfileEmail {
    email: String
    verified: Boolean
  }
  type GroupId {
    id: ID!
  }
  type ExpenseId {
    id: ID!
    groupId: Int!
  }
  type PaymentId {
    id: ID!
    groupId: Int!
  }
  type GroupItem {
    id: ID!
    createdAt: Date!
    updatedAt: Date!
    title: String!
  }
  type Group {
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
