import { AppProps } from "next/app";
import { Client, Provider, fetchExchange, gql } from "urql";
import { cacheExchange } from "@urql/exchange-graphcache";
import { devtoolsExchange } from "@urql/devtools";
import { GroupQuery } from "./group/[groupId]";
import { AllGroupsQuery } from "./index";

const client = new Client({
  url: "/api/graphql",
  exchanges: [
    devtoolsExchange,
    cacheExchange({
      updates: {
        Mutation: {
          createGroup: (result, args, cache) => {
            cache.updateQuery({ query: AllGroupsQuery }, (data) => {
              data.groups.push(result.createGroup);
              return data;
            });
          },
          createPayment: (result, args, cache) => {
            cache.invalidate({
              __typename: "GroupDetails",
              id: Number(args.groupId),
            });
          },
          updatePayment: (result, args, cache) => {
            cache.invalidate({
              __typename: "GroupDetails",
              id: Number(args.groupId),
            });
          },
          deletePayment: (result, args, cache) => {
            cache.invalidate({
              __typename: "GroupDetails",
              id: Number((result?.deletePayment as any)?.groupId),
            });
          },
        },
      },
    }),
    fetchExchange,
  ],
  // fetchOptions: () => {
  //   const token = getToken();
  //   return {
  //     headers: { authorization: token ? `Bearer ${token}` : '' },
  //   };
  // },
});

const App = ({ Component, pageProps }: AppProps) => {
  return (
    <Provider value={client}>
      <h1>Splitdumb</h1>
      <Component {...pageProps} />
    </Provider>
  );
};

export default App;
