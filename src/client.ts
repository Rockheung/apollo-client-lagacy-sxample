import { ApolloClient } from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import { HttpLink } from "apollo-link-http";
import { onError } from "apollo-link-error";
import { ApolloLink, Observable } from "apollo-link";
import gql from "graphql-tag";

import * as Query from "./graphql/query.resolver";
import * as Mutation from "./graphql/mutation.resolver";

const cache = new InMemoryCache({
  dataIdFromObject: (obj: { __typename: string; _id: string }) =>
    `${obj.__typename}:${obj._id}`,
  cacheRedirects: {
    Query: {
      movie: (_, { id }, { getCacheKey }) =>
        getCacheKey({ __typename: "Movie", id }),
    },
  },
});

const request = async (operation) => {
  operation.setContext({
    headers: {
      authorization: "hello auth",
    },
  });
};

const requestLink = new ApolloLink(
  (operation, forward) =>
    new Observable((observer) => {
      let handle;
      Promise.resolve(operation)
        .then((oper) => request(oper))
        .then(() => {
          handle = forward(operation).subscribe({
            next: observer.next.bind(observer),
            error: observer.error.bind(observer),
            complete: observer.complete.bind(observer),
          });
        })
        .catch(observer.error.bind(observer));

      return () => {
        if (handle) handle.unsubscribe();
      };
    })
);

const client: any = new ApolloClient({
  link: ApolloLink.from([
    onError(({ graphQLErrors, networkError }) => {
      if (graphQLErrors) {
        console.log("[graphQLErrors]", graphQLErrors);
        // sendToLoggingService(graphQLErrors);
      }
      if (networkError) {
        console.log("[networkError]", networkError);
        // logoutUser();
      }
    }),
    requestLink,
    new HttpLink({
      uri: "https://countries-274616.ew.r.appspot.com",
      // credentials: "include",
    }),
  ]),
  cache,
  typeDefs: gql`
    extend type Query {
      getMyName: JSONObject
    }
  `,
  resolvers: {
    Query,
    Mutation,
  },
});

cache.writeData({
  data: {
    users: [
      {
        _id: 0,
        name: "rock",
        __typename: "User",
      },
    ],
  },
});

export default client;
