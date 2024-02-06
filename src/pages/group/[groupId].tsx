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
    <h3>
      {item.title} &minus; {item.sum}&euro;
    </h3>
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
    <h3>
      {item.sender.name} sent {item.sum}&euro; to {item.receiver.name}
    </h3>
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
