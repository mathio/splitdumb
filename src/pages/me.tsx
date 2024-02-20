import { useState } from "react";
import { gql, useMutation, useQuery } from "urql";
import Link from "next/link";

export const UpdateProfileMutation = gql`
  mutation UpdateProfileMutation($name: String!) {
    updateProfile(name: $name) {
      id
      name
      email
      image
    }
  }
`;

const MyProfileForm = ({ data }) => {
  const [name, setName] = useState(data?.name ?? "");
  const [updateResult, update] = useMutation(UpdateProfileMutation);

  const submitForm = async (event) => {
    event.preventDefault();
    await update({ name });
  };

  return (
    <form onSubmit={submitForm}>
      <img src={data?.image} alt={data?.name} style={{ width: 100 }} />
      <br />
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.currentTarget.value)}
      />
      <br />
      <input type="text" value={data.email} disabled />
      <br />
      <button>save</button>
    </form>
  );
};

export const MyProfileQuery = gql`
  query MyProfileQuery {
    me {
      id
      name
      email
      image
    }
  }
`;
const MyProfile = () => {
  const [{ data, fetching, error }] = useQuery({
    query: MyProfileQuery,
  });
  return (
    <div>
      <Link href="/">&larr; Back home</Link>
      <h2>My Profile</h2>
      {fetching && <p>Loading...</p>}
      {error && <p>Failed 🤷</p>}
      {data && <MyProfileForm data={data.me} />}
    </div>
  );
};

export default MyProfile;
