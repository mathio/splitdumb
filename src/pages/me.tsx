import { useEffect, useState } from "react";
import { gql, useMutation, useQuery } from "urql";
import Link from "next/link";
import { useRouter } from "next/router";

export const UpdateProfileMutation = gql`
  mutation UpdateProfileMutation(
    $name: String!
    $emails: [String!]
    $primaryEmail: String
  ) {
    updateProfile(name: $name, emails: $emails, primaryEmail: $primaryEmail) {
      id
      name
      email
      image
    }
  }
`;

export const LinkEmailMutation = gql`
  mutation LinkEmailMutation($token: String!) {
    linkEmail(token: $token) {
      id
      email
    }
  }
`;

const MyProfileForm = ({ data }) => {
  const {
    query: { linkEmail },
    replace: routerReplace,
  } = useRouter();
  const [name, setName] = useState(data?.name ?? "");
  const [primaryEmail, setPrimaryEmail] = useState(data?.email ?? "");
  const [emails, setEmails] = useState(data.emails ?? []);
  const [{ fetching }, update] = useMutation(UpdateProfileMutation);
  const [linkResult, doLink] = useMutation(LinkEmailMutation);

  useEffect(() => {
    if (linkEmail) {
      routerReplace("/me");
      doLink({ token: linkEmail });
    }
  }, [linkEmail]);

  const submitForm = async (event) => {
    event.preventDefault();
    await update({
      name,
      primaryEmail,
      emails: emails
        .map(({ email }) => email)
        .filter((value) => value.includes("@")),
    });
  };

  return (
    <form onSubmit={submitForm}>
      {linkResult.fetching && <p>Linking email...</p>}
      <img src={data?.image} alt={data?.name} style={{ width: 100 }} />
      <br />
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.currentTarget.value)}
        disabled={fetching}
      />
      <br />
      emails:
      <br />
      <input type="email" value={data.email} disabled />{" "}
      {primaryEmail === data.email ? (
        <strong>primary</strong>
      ) : (
        <button type="button" onClick={() => setPrimaryEmail(data.email)}>
          make primary
        </button>
      )}
      <br />
      other emails: <br />
      {emails.map(({ email, verified }, index) => (
        <div key={index}>
          <input
            type="email"
            value={email}
            disabled={verified !== null}
            onChange={(event) =>
              setEmails(
                emails.map((e, i) =>
                  i === index
                    ? { email: event.currentTarget.value, verified: null }
                    : e,
                ),
              )
            }
          />
          {verified ? <span>verified</span> : <span>pending</span>}
          <button
            type="button"
            onClick={() =>
              confirm("remove email?") &&
              setEmails(emails.filter((_, i) => i !== index))
            }
          >
            remove
          </button>
          {primaryEmail === email ? (
            <strong>primary</strong>
          ) : (
            verified && (
              <button type="button" onClick={() => setPrimaryEmail(email)}>
                make primary
              </button>
            )
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={() => setEmails([...emails, { email: "", verified: null }])}
      >
        add email
      </button>
      <br />
      <button disabled={fetching}>save</button>
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
      emails {
        email
        verified
      }
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
