import { useEffect, useState } from "react";
import Link from "next/link";
import { gql, useMutation, useQuery } from "urql";
import { useRouter } from "next/router";

const CreateGroupMutation = `
  mutation ($title: String!, $groupFriends: JSON!) {
    createGroup (title: $title, groupFriends: $groupFriends) {
      id
      title
    }
  }
`;

const NewGroup = () => {
  const { push: routerPush } = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [groupFriends, setGroupFriends] = useState({});
  const [createGroupResult, createGroup] = useMutation(CreateGroupMutation);
  const [
    { data: dataFriends, fetching: fetchingFriends, error: errorFriends },
  ] = useQuery({ query: AllFriendsQuery });

  useEffect(() => {
    if (dataFriends) {
      setGroupFriends(
        dataFriends.friends.reduce(
          (acc, { id }) => ({ ...acc, [id]: true }),
          {},
        ),
      );
    }
  }, [dataFriends]);

  useEffect(() => {
    if (createGroupResult?.data?.createGroup?.id) {
      routerPush(`/group/${createGroupResult?.data?.createGroup?.id}`);
    }
  }, [createGroupResult]);

  if (!isEditing) {
    return (
      <h2>
        <button onClick={() => setIsEditing(true)}>new group</button>
      </h2>
    );
  }

  const saveGroup = async (event) => {
    event.preventDefault();
    if (title.length > 0) {
      await createGroup({ title, groupFriends: JSON.stringify(groupFriends) });
      setIsEditing(false);
    }
  };

  return (
    <form onSubmit={saveGroup}>
      <input
        autoFocus
        type="text"
        value={title}
        onChange={(e) => setTitle(e.currentTarget.value)}
        disabled={createGroupResult.fetching}
      />
      {fetchingFriends && <p>Loading friends...</p>}
      {dataFriends && (
        <ul>
          {dataFriends.friends.map((friend) => (
            <li key={friend.id}>
              <label>
                <input
                  type="checkbox"
                  checked={groupFriends[friend.id]}
                  onChange={(e) =>
                    setGroupFriends({
                      ...groupFriends,
                      [friend.id]: e.currentTarget.checked,
                    })
                  }
                />
                {friend.name}
              </label>
            </li>
          ))}
        </ul>
      )}
      <button disabled={createGroupResult.fetching || title.length === 0}>
        save
      </button>
    </form>
  );
};

export const AllGroupsQuery = gql`
  query AllGroupsQuery {
    groups {
      id
      title
    }
  }
`;

const Groups = () => {
  const [{ data, fetching, error }] = useQuery({
    query: AllGroupsQuery,
  });
  return (
    <div>
      <h2>Groups</h2>
      {fetching && <p>Loading...</p>}
      {error && <p>Failed 🤷</p>}
      {data && (
        <ul>
          {data.groups.map((group) => (
            <li key={group.id}>
              <Link href={`/group/${group.id}`}>{group.title}</Link>
            </li>
          ))}
        </ul>
      )}
      <NewGroup />
    </div>
  );
};

const AddFriendMutation = `
  mutation ($name: String!, $email: String!) {
    addFriend (name: $name, email: $email) {
      id
      name
      email
    }
  }
`;

const NewFriend = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [addFriendResult, addFriend] = useMutation(AddFriendMutation);

  const saveFriend = async (event) => {
    event.preventDefault();
    if (name.length > 0 && email.includes("@")) {
      await addFriend({ name, email });
      setName("");
      setEmail("");
    }
  };

  return (
    <form onSubmit={saveFriend}>
      name:
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.currentTarget.value)}
        disabled={addFriendResult.fetching}
      />
      email:
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.currentTarget.value)}
        disabled={addFriendResult.fetching}
      />
      <button
        disabled={
          addFriendResult.fetching || name.length === 0 || !email.includes("@")
        }
      >
        save
      </button>
    </form>
  );
};

export const AllFriendsQuery = gql`
  query AllFriendsQuery {
    friends {
      id
      name
      email
    }
  }
`;

const Friends = () => {
  const [{ data, fetching, error }] = useQuery({
    query: AllFriendsQuery,
  });
  return (
    <div>
      <h2>Friends</h2>
      {fetching && <p>Loading...</p>}
      {error && <p>Failed 🤷</p>}
      {data && (
        <ul>
          {data.friends.map((user) => (
            <li key={user.id}>
              {user.name} &minus; {user.email}
            </li>
          ))}
        </ul>
      )}
      <NewFriend />
    </div>
  );
};

const IndexPage = () => (
  <>
    <Groups />
    <Friends />
  </>
);

export default IndexPage;
