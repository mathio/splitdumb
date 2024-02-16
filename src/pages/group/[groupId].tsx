import { useRouter } from "next/router";
import { gql, useQuery } from "urql";
import Link from "next/link";

const GroupQuery = gql`
  query ($id: Int!) {
    group(id: $id) {
      id
      title
      user {
        name
      }
      totals {
        sum
        user {
          name
        }
      }
      transactions {
        user {
          name
        }
        from {
          user {
            name
          }
          sum
        }
        to {
          user {
            name
          }
          sum
        }
      }
      feed {
        id
        __typename
        createdAt
        ... on Expense {
          title
          user {
            name
          }
          sum
          payments {
            id
            sum
            user {
              name
            }
          }
          debts {
            id
            sum
            user {
              name
            }
          }
        }
        ... on Payment {
          sender {
            name
          }
          receiver {
            name
          }
          sum
        }
      }
    }
  }
`;

const Expense = ({ item }) => (
  <>
    <h4>
      {item.title}: {item.sum}&euro;
    </h4>
    <p>
      Created by {item.user.name} at {item.createdAt}
    </p>
    <p>Paid by:</p>
    <ul>
      {item.payments.map((balance) => (
        <li key={balance.id}>
          {balance.user.name}: {balance.sum}&euro;
        </li>
      ))}
    </ul>
    <p>Owed by:</p>
    <ul>
      {item.debts.map((balance) => (
        <li key={balance.id}>
          {balance.user.name}: {balance.sum}&euro;
        </li>
      ))}
    </ul>
  </>
);

const Payment = ({ item }) => (
  <>
    <h4>
      {item.sender.name} sent {item.sum}&euro; to {item.receiver.name}
    </h4>
    <p>At {item.createdAt}</p>
  </>
);

const Groups = () => {
  const {
    query: { groupId },
  } = useRouter();
  const [{ data, fetching, error }] = useQuery({
    query: GroupQuery,
    variables: { id: Number(groupId) },
  });
  return (
    <div>
      <Link href="/">&larr; Back to groups</Link>
      {fetching && <p>Loading...</p>}
      {error && <p>Failed 🤷</p>}
      {data && (
        <>
          <h2>{data.group.title}</h2>
          <p>Created by {data.group.user.name}</p>
          <p>Totals:</p>
          <ul>
            {data.group.totals.map((item) => (
              <li key={item.id}>
                {item.user.name}: {item.sum}&euro;
              </li>
            ))}
          </ul>
          <h3>Payments:</h3>
          <ul>
            {data.group.transactions.map((item) => (
              <li key={item.user.id}>
                <p>{item.user.name}</p>
                {item.from.length > 0 && (
                  <>
                    <p>Receives:</p>
                    <ul>
                      {item.from.map((from) => (
                        <li key={from.user.id}>
                          {from.user.name}: {from.sum}&euro;
                        </li>
                      ))}
                    </ul>
                  </>
                )}
                {item.to.length > 0 && (
                  <>
                    <p>Pays:</p>
                    <ul>
                      {item.to.map((to) => (
                        <li key={to.user.id}>
                          {to.user.name}: {to.sum}&euro;
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </li>
            ))}
          </ul>
          <h3>Feed:</h3>
          <ul>
            {data.group.feed.map((item) => (
              <li key={item.id}>
                {item.__typename === "Expense" && <Expense item={item} />}
                {item.__typename === "Payment" && <Payment item={item} />}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

const IndexPage = () => <Groups />;

export default IndexPage;
