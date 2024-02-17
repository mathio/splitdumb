import type { NextApiRequest, NextApiResponse } from "next";
import { createSchema, createYoga } from "graphql-yoga";
import { typeDefs } from "../../lib/graphql/typeDefs";
import { resolvers } from "../../lib/graphql/resolvers";

export const config = {
  api: {
    bodyParser: false,
  },
};

const schema: any = createSchema({
  typeDefs,
  resolvers,
});

export default createYoga<{
  req: NextApiRequest;
  res: NextApiResponse;
}>({
  schema,
  graphqlEndpoint: "/api/graphql",
});
