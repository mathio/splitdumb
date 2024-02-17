import { AppProps } from "next/app";
import { Client, Provider, fetchExchange, gql } from "urql";
import { cacheExchange } from "@urql/exchange-graphcache";
import { devtoolsExchange } from "@urql/devtools";
import { AllGroupsQuery } from "./index";

const invalidateGroup = (result, args, cache) => {
  cache.invalidate({
    __typename: "Group",
    id: args.groupId ?? (Object.values(result).at(0) as any).groupId,
  });
};

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
          deleteGroup: (result, args, cache) => {
            cache.updateQuery({ query: AllGroupsQuery }, (data) => {
              data.groups.splice(
                data.groups.findIndex(({ id }) => id === args.id),
                1,
              );
              return data;
            });
          },
          createExpense: invalidateGroup,
          updateExpense: invalidateGroup,
          deleteExpense: invalidateGroup,
          createPayment: invalidateGroup,
          updatePayment: invalidateGroup,
          deletePayment: invalidateGroup,
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
