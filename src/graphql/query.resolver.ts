import gql from "graphql-tag";

export async function getMyName(_, args, { client, cache }) {
  const { users } = cache.readQuery({
    query: gql`
      query {
        users {
          name
        }
      }
    `,
  });

  console.log("getMyName", users);

  return users.map((user) => {
    return {
      ...user,
      age: 17,
      __typename: "User",
    };
  });
}
