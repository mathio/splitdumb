import type { NextApiRequest, NextApiResponse } from "next";
import { createSchema, createYoga } from "graphql-yoga";
import { typeDefs } from "../../lib/graphql/typeDefs";
import { resolvers } from "../../lib/graphql/resolvers";
import { getSession } from "next-auth/react";

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
  context: async ({ request }) => {
    const cookie = request.headers.get("cookie");
    const session = await getSession({ req: { headers: { cookie } } });
    return { user: session?.user };
  },
});
