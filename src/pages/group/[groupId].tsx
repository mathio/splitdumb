import { useState } from "react";
import { useRouter } from "next/router";
import { gql, useMutation, useQuery } from "urql";
import Link from "next/link";

const GroupQuery = gql`
  query GroupQuery($id: String!) {
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

const Expense = ({ group, item }) => {
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    return (
      <ExpenseForm
        expense={item}
        groupId={group.id}
        users={group.members}
        cancel={() => setIsEditing(false)}
      />
    );
  }

  return (
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
      <button onClick={() => setIsEditing(true)}>edit</button>
    </>
  );
};

const Payment = ({ group, item }) => {
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    return (
      <PaymentForm
        groupId={group.id}
        users={group.members}
        payment={item}
        cancel={() => setIsEditing(false)}
      />
    );
  }
  return (
    <>
      <h4>
        {item.sender.name} sent {item.sum}&euro; to {item.receiver.name}
      </h4>
      <p>At {item.createdAt}</p>
      <button onClick={() => setIsEditing(true)}>edit</button>
    </>
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

const DeleteGroupMutation = gql`
  mutation DeleteGroupMutation($id: String!) {
    deleteGroup(id: $id) {
      id
    }
  }
`;

const GroupForm = ({ group }) => {
  const { push: routerPush } = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(group.title);
  const [updateGroupResult, updateGroup] = useMutation(UpdateGroupMutation);
  const [deleteResult, doDelete] = useMutation(DeleteGroupMutation);

  const deleteGroup = async () => {
    if (confirm("delete?")) {
      await doDelete({ id: group.id });
      await routerPush("/");
    }
  };

  if (!isEditing) {
    return (
      <h2>
        {title} <button onClick={() => setIsEditing(true)}>edit</button>{" "}
        <button onClick={deleteGroup} disabled={deleteResult.fetching}>
          delete
        </button>
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
  mutation (
    $sum: Float!
    $groupId: String!
    $senderId: String!
    $receiverId: String!
  ) {
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
    $id: ID!
    $sum: Float!
    $groupId: String!
    $senderId: String!
    $receiverId: String!
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
  mutation UpdatePaymentMutation($id: ID!) {
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
        groupId: groupId,
        senderId: senderId,
        receiverId: receiverId,
        ...(payment ? { id: payment.id } : {}),
      });
      cancelEditing();
    }
  };

  const deletePayment = async () => {
    await doDelete({ id: payment.id });
    cancelEditing();
  };

  const cancelEditing = (event = null) => {
    event?.preventDefault();
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
        onChange={(e) => setSenderId(e.currentTarget.value)}
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
        onChange={(e) => setReceiverId(e.currentTarget.value)}
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
  const {
    push: routerPush,
    query: { payment },
  } = useRouter();

  if (!payment) {
    return (
      <h2>
        <Link href={`/group/${groupId}?payment=new`}>
          <button>new payment</button>
        </Link>
      </h2>
    );
  }

  return (
    <PaymentForm
      groupId={groupId}
      users={users}
      cancel={() => routerPush(`/group/${groupId}`)}
    />
  );
};

const CreateExpenseMutation = gql`
  mutation CreateExpenseMutation(
    $title: String!
    $sum: Float!
    $paysUserId: String!
    $groupId: String!
    $split: JSON!
  ) {
    createExpense(
      title: $title
      sum: $sum
      paysUserId: $paysUserId
      groupId: $groupId
      split: $split
    ) {
      id
    }
  }
`;

const UpdateExpenseMutation = gql`
  mutation UpdateExpenseMutation(
    $id: ID!
    $title: String!
    $sum: Float!
    $paysUserId: String!
    $groupId: String!
    $split: JSON!
  ) {
    updateExpense(
      id: $id
      title: $title
      sum: $sum
      paysUserId: $paysUserId
      groupId: $groupId
      split: $split
    ) {
      id
    }
  }
`;

const DeleteExpenseMutation = gql`
  mutation DeleteExpenseMutation($id: ID!) {
    deleteExpense(id: $id) {
      id
      groupId
    }
  }
`;

const ExpenseForm = ({ groupId, users, expense = null, cancel }) => {
  const [title, setTitle] = useState(expense?.title ?? "");
  const [sum, setSum] = useState(expense?.sum ?? "");
  const [paysUserId, setPaysUserId] = useState(
    expense?.payments?.[0]?.user?.id,
  );
  const [split, setSplit] = useState(
    expense?.split ??
      users.reduce((acc, user) => ({ ...acc, [user.id]: true }), {}),
  );
  const [saveResult, save] = useMutation(
    expense ? UpdateExpenseMutation : CreateExpenseMutation,
  );
  const [deleteResult, doDelete] = useMutation(DeleteExpenseMutation);

  const savePayment = async (event) => {
    event.preventDefault();
    await save({
      sum: parseFloat(sum),
      groupId: groupId,
      split: JSON.stringify(split),
      title,
      paysUserId: paysUserId,
      ...(expense ? { id: expense.id } : {}),
    });
    cancelEditing();
  };

  const deleteExpense = async () => {
    await doDelete({ id: expense.id });
    cancelEditing();
  };

  const cancelEditing = (event = null) => {
    event?.preventDefault();
    setSum("");
    cancel();
  };

  return (
    <form onSubmit={savePayment}>
      title{" "}
      <input
        autoFocus
        type="text"
        value={title}
        onChange={(e) => setTitle(e.currentTarget.value)}
        disabled={saveResult.fetching}
      />
      <br />
      sum{" "}
      <input
        type="text"
        value={sum}
        onChange={(e) => setSum(e.currentTarget.value)}
        disabled={saveResult.fetching}
      />
      <br />
      paid by{" "}
      <select
        value={paysUserId}
        onChange={(e) => setPaysUserId(e.currentTarget.value)}
      >
        <option>---</option>
        {users.map((user) => (
          <option key={user.id} value={user.id}>
            {user.name}
          </option>
        ))}
      </select>
      <br />
      split{" "}
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            {user.name}
            <input
              type="checkbox"
              checked={split[user.id]}
              onChange={(e) =>
                setSplit({ ...split, [user.id]: e.currentTarget.checked })
              }
            />
          </li>
        ))}
      </ul>
      <br />
      <button
        disabled={saveResult.fetching || sum.length === 0 || title.length === 0}
      >
        save
      </button>
      {expense && (
        <button disabled={deleteResult.fetching} onClick={deleteExpense}>
          delete
        </button>
      )}
      <button disabled={saveResult.fetching} onClick={cancelEditing}>
        cancel
      </button>
    </form>
  );
};

const NewExpense = ({ groupId, users }) => {
  const {
    push: routerPush,
    query: { expense },
  } = useRouter();
  if (!expense) {
    return (
      <h2>
        <Link href={`/group/${groupId}?expense=new`}>
          <button>new expense</button>
        </Link>
      </h2>
    );
  }

  return (
    <ExpenseForm
      groupId={groupId}
      users={users}
      cancel={() => routerPush(`/group/${groupId}`)}
    />
  );
};

const Group = () => {
  const {
    query: { groupId },
  } = useRouter();
  const [{ data, fetching, error }] = useQuery({
    query: GroupQuery,
    variables: { id: groupId },
  });

  return (
    <div>
      <Link href="/">&larr; Back to groups</Link>
      {fetching && <p>Loading...</p>}
      {error && <p>Failed 🤷</p>}
      {data && (
        <>
          <GroupForm group={data.group} />
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
          <NewExpense groupId={data.group.id} users={data.group.members} />
          <NewPayment groupId={data.group.id} users={data.group.members} />
          <h3>Feed:</h3>
          <ul>
            {data.group.feed?.map((item) => (
              <li key={`${item.__typename}-${item.id}`}>
                {item.__typename === "Expense" && (
                  <Expense item={item} group={data.group} />
                )}
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
