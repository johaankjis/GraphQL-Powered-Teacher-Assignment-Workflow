import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client"

export const createApolloClient = () => {
  return new ApolloClient({
    link: new HttpLink({
      uri: "/api/graphql",
    }),
    cache: new InMemoryCache(),
  })
}
