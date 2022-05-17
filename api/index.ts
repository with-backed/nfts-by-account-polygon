import { ApolloServer, gql } from "apollo-server-express";
import { ApolloServerPluginDrainHttpServer } from "apollo-server-core";
import http from "http";
import express from "express";
import cors from "cors";
import { getNFTsForAccount } from "../lib/getNFTsForAccount";

const app = express();
app.use(cors());
app.use(express.json());
const httpServer = http.createServer(app);

const typeDefs = gql`
  type Account {
    id: String!
    tokens: [Token]!
  }

  type Token {
    id: ID!
    identifier: BigInt!
    uri: String
    approvals: [Approval]!
  }

  type Approval {
    id: ID!
    approved: Account!
  }

  type Query {
    account(id: String!): Account
  }
`;

const resolvers = {
  Query: {
    account: async (_parent, args, _context, _info) => ({
      id: args.id,
      tokens: await getNFTsForAccount(args.id),
    }),
  },
};

const startApolloServer = async (app, httpServer) => {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });

  await server.start();
  server.applyMiddleware({ app });
};

startApolloServer(app, httpServer);

export default httpServer;
