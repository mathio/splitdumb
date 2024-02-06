import Link from "next/link";
import { gql, useQuery } from "urql";

const AllGroupsQuery = gql`
  query {
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
    </div>
  );
};

const IndexPage = () => <Groups />;

export default IndexPage;
