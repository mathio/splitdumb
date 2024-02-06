import { AppProps } from "next/app";
import { Client, Provider, cacheExchange, fetchExchange } from "urql";

const client = new Client({
  url: "/api/graphql",
  exchanges: [cacheExchange, fetchExchange],
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
