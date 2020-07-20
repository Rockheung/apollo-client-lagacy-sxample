import React from "react";
import { useQuery } from "@apollo/react-hooks";
import gql from "graphql-tag";

function App() {
  const { loading, data, error } = useQuery(gql`
    query {
      getMyName @client
      Country(first: 10) {
        _id
        name
      }
    }
  `);

  if (loading) return <p>{"Loading..."}</p>;
  if (error) {
    console.log(error);
    return <p>{"Error!"}</p>;
  }
  return <p>{JSON.stringify(data.Country, undefined, 2)}</p>;
}

export default App;
