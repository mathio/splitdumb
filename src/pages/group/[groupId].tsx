import { useState } from "react";
import { useRouter } from "next/router";
import { gql, useMutation, useQuery } from "urql";
import Link from "next/link";

export const GroupQuery = gql`
  query GroupQuery($id: Int!) {
    group(id: $id) {
      id
      title
      user {
        id
        name
      }
      members {
        id
        name
      }
      totals {
        id
        sum
        user {
          id
          name
        }
      }
      transactions {
        id
        user {
          id
          name
        }
        from {
          id
          user {
            id
            name
          }
          sum
        }
        to {
          id
          user {
            id
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
            id
            name
          }
          sum
          payments {
            id
            sum
            user {
              id
              name
            }
          }
          debts {
            id
            sum
            user {
              id
              name
            }
          }
        }
        ... on Payment {
          sender {
            id
            name
          }
          receiver {
            id
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
      {item.payments?.map((balance) => (
        <li key={balance.id}>
          {balance.user.name}: {balance.sum}&euro;
        </li>
      ))}
    </ul>
    <p>Owed by:</p>
    <ul>
      {item.debts?.map((balance) => (
        <li key={balance.id}>
          {balance.user.name}: {balance.sum}&euro;
        </li>
      ))}
    </ul>
  </>
);

const Payment = ({ group, item }) => {
  const [isEditing, setIsEditing] = useState(false);

  if (!isEditing) {
    return (
      <>
        <h4>
          {item.sender.name} sent {item.sum}&euro; to {item.receiver.name}
        </h4>
        <p>At {item.createdAt}</p>
        <button onClick={() => setIsEditing(true)}>edit</button>
      </>
    );
  }

  return (
    <PaymentForm
      groupId={group.id}
      users={group.members}
      payment={item}
      cancel={() => setIsEditing(false)}
    />
  );
};

const UpdateGroupMutation = `
  mutation ($id: ID!, $title: String!) {
    updateGroup (id: $id, title: $title) {
      id
      title
    }
  }
`;

const GroupTitle = ({ group }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(group.title);
  const [updateGroupResult, updateGroup] = useMutation(UpdateGroupMutation);

  if (!isEditing) {
    return (
      <h2>
        {title} <button onClick={() => setIsEditing(true)}>edit</button>
      </h2>
    );
  }

  const saveTitle = async (event) => {
    event.preventDefault();
    await updateGroup({ id: group.id, title });
    setIsEditing(false);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setTitle(group.title);
  };

  return (
    <form onSubmit={saveTitle}>
      <input
        autoFocus
        type="text"
        value={title}
        onChange={(e) => setTitle(e.currentTarget.value)}
        disabled={updateGroupResult.fetching}
      />
      <button disabled={updateGroupResult.fetching}>save</button>
      <button disabled={updateGroupResult.fetching} onClick={cancelEditing}>
        cancel
      </button>
    </form>
  );
};

const CreatePaymentMutation = gql`
  mutation ($sum: Float!, $groupId: Int!, $senderId: Int!, $receiverId: Int!) {
    createPayment(
      sum: $sum
      groupId: $groupId
      senderId: $senderId
      receiverId: $receiverId
    ) {
      id
    }
  }
`;

const UpdatePaymentMutation = gql`
  mutation UpdatePaymentMutation(
    $id: Int!
    $sum: Float!
    $groupId: Int!
    $senderId: Int!
    $receiverId: Int!
  ) {
    updatePayment(
      id: $id
      sum: $sum
      groupId: $groupId
      senderId: $senderId
      receiverId: $receiverId
    ) {
      id
    }
  }
`;

const DeletePaymentMutation = gql`
  mutation UpdatePaymentMutation($id: Int!) {
    deletePayment(id: $id) {
      id
      groupId
    }
  }
`;
const PaymentForm = ({ groupId, users, payment = null, cancel }) => {
  const [sum, setSum] = useState(payment?.sum ?? "");
  const [senderId, setSenderId] = useState(payment?.sender?.id);
  const [receiverId, setReceiverId] = useState(payment?.receiver?.id);
  const [saveResult, save] = useMutation(
    payment ? UpdatePaymentMutation : CreatePaymentMutation,
  );
  const [deleteResult, doDelete] = useMutation(DeletePaymentMutation);

  const savePayment = async (event) => {
    event.preventDefault();
    if (sum.length > 0 && senderId && receiverId) {
      await save({
        sum: parseFloat(sum),
        groupId: Number(groupId),
        senderId: Number(senderId),
        receiverId: Number(receiverId),
        ...(payment ? { id: Number(payment.id) } : {}),
      });
      cancelEditing();
    }
  };

  const deletePayment = async () => {
    await doDelete({ id: Number(payment.id) });
    cancelEditing();
  };

  const cancelEditing = () => {
    setSum("");
    setSenderId(undefined);
    setReceiverId(undefined);
    cancel();
  };

  return (
    <form onSubmit={savePayment}>
      from{" "}
      <select
        value={senderId}
        onChange={(e) => setSenderId(Number(e.currentTarget.value))}
      >
        <option>---</option>
        {users.map((user) => (
          <option key={user.id} value={user.id}>
            {user.name}
          </option>
        ))}
      </select>
      to{" "}
      <select
        value={receiverId}
        onChange={(e) => setReceiverId(Number(e.currentTarget.value))}
      >
        <option>---</option>
        {users.map((user) => (
          <option key={user.id} value={user.id}>
            {user.name}
          </option>
        ))}
      </select>
      <input
        autoFocus
        type="text"
        value={sum}
        onChange={(e) => setSum(e.currentTarget.value)}
        disabled={saveResult.fetching}
      />
      <button disabled={saveResult.fetching || sum.length === 0}>save</button>
      {payment && (
        <button disabled={deleteResult.fetching} onClick={deletePayment}>
          delete
        </button>
      )}
      <button disabled={saveResult.fetching} onClick={cancelEditing}>
        cancel
      </button>
    </form>
  );
};

const NewPayment = ({ groupId, users }) => {
  const [isEditing, setIsEditing] = useState(false);
  if (!isEditing) {
    return (
      <h2>
        <button onClick={() => setIsEditing(true)}>new payment</button>
      </h2>
    );
  }

  return (
    <PaymentForm
      groupId={groupId}
      users={users}
      cancel={() => setIsEditing(false)}
    />
  );
};

const Group = () => {
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
          <GroupTitle group={data.group} />
          <p>Created by {data.group.user.name}</p>
          <h3>Totals:</h3>
          <ul>
            {data.group.totals.map((item) => (
              <li key={item.user.id}>
                {item.user.name}: {item.sum}&euro;
              </li>
            ))}
          </ul>
          <h3>Payments:</h3>
          <ul>
            {data.group.transactions.map((item) => (
              <li key={item.id}>
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
          <NewPayment groupId={data.group.id} users={data.group.members} />
          <h3>Feed:</h3>
          <ul>
            {data.group.feed?.map((item) => (
              <li key={`${item.__typename}-${item.id}`}>
                {item.__typename === "Expense" && <Expense item={item} />}
                {item.__typename === "Payment" && (
                  <Payment item={item} group={data.group} />
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

const IndexPage = () => <Group />;

export default IndexPage;
