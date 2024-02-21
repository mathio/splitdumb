import { AppProps } from "next/app";
import { Client, Provider, fetchExchange, gql } from "urql";
import { cacheExchange } from "@urql/exchange-graphcache";
import { devtoolsExchange } from "@urql/devtools";
import { SessionProvider, signOut, useSession } from "next-auth/react";
import { AllFriendsQuery, AllGroupsQuery } from "./index";
import Link from "next/link";
import { updateProfile } from "../lib/user/update-profile";
import { MyProfileQuery } from "./me";

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
          updateProfile: (result, args, cache) => {
            cache.invalidate({
              __typename: "Profile",
              id: Number((result.updateProfile as any).id),
            });
          },
          linkEmail: (result, args, cache) => {
            cache.invalidate({
              __typename: "Profile",
              id: Number((result.linkEmail as any).id),
            });
          },
          createGroup: (result, args, cache) => {
            cache.updateQuery({ query: AllGroupsQuery }, (data) => {
              data?.groups?.unshift(result.createGroup);
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
          addFriend: (result, args, cache) => {
            cache.updateQuery({ query: AllFriendsQuery }, (data) => {
              data?.friends?.push(result.addFriend);
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
});

const Header = () => {
  const { data: session, status } = useSession();
  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <h1>💸 splitdumb</h1>
      {status === "loading" && <div>Validating session ...</div>}
      {!session && <Link href="/api/auth/signin">log in</Link>}
      {session && (
        <p>
          <Link href="/me">
            <img
              src={session.user.image}
              alt={session.user.name}
              style={{ height: 50 }}
            />{" "}
            {session.user.name}{" "}
          </Link>
          <a onClick={() => confirm("log out?") && signOut()}>log out</a>
        </p>
      )}
    </nav>
  );
};

const App = ({ Component, pageProps }: AppProps) => {
  return (
    <SessionProvider session={pageProps.session}>
      <Provider value={client}>
        <Header />
        <Component {...pageProps} />
      </Provider>
    </SessionProvider>
  );
};

export default App;
