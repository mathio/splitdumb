import Link from "next/link";
import { gql, useMutation, useQuery } from "urql";
import { useState } from "react";

const CreateGroupMutation = `
  mutation ($title: String!) {
    createGroup (title: $title) {
      id
      title
    }
  }
`;

const NewGroup = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [createGroupResult, createGroup] = useMutation(CreateGroupMutation);

  if (!isEditing) {
    return (
      <h2>
        <button onClick={() => setIsEditing(true)}>new</button>
      </h2>
    );
  }

  const saveTitle = async (event) => {
    event.preventDefault();
    if (title.length > 0) {
      await createGroup({ title });
      setIsEditing(false);
    }
  };

  return (
    <form onSubmit={saveTitle}>
      <input
        autoFocus
        type="text"
        value={title}
        onChange={(e) => setTitle(e.currentTarget.value)}
        disabled={createGroupResult.fetching}
      />
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

const IndexPage = () => <Groups />;

export default IndexPage;
