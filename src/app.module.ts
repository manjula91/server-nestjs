import { Module, MiddlewareConsumer } from '@nestjs/common';
import { GraphQLModule, GraphQLFactory } from '@nestjs/graphql';
import { Prisma } from 'prisma-binding';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TweetsModule } from './tweets/tweets.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import expressPlayground from 'graphql-playground-middleware-express';

// tslint:disable-next-line:no-var-requires
const { graphqlExpress} = require('apollo-server-express');

const { ApolloServer } = require('apollo-server');
// tslint:disable-next-line:no-var-requires
const { importSchema } = require('graphql-import');
// tslint:disable-next-line:no-var-requires
const path = require('path');

@Module({
  imports: [
    AuthModule,
    GraphQLModule,
    TweetsModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
  ],
})
export class AppModule {
  /**
   * @description Construct the app module with graphql enabled
   * @param graphQLFactory takes the nestjs graphql service service
   */
  constructor(
    private readonly graphQLFactory: GraphQLFactory,
  ) {}

  configure(consumer: MiddlewareConsumer) {

    const schema = this.createSchema();
    
    // const typeDefs = importSchema(path.resolve('src/schema.graphql'));

    // const server = new ApolloServer({
    //     typeDefs,
    //     context: req => ({
    //       ...req,
    //       prisma: new Prisma({
    //         typeDefs: 'src/generated/prisma.graphql',
    //         endpoint: process.env.PRISMA_URL,
    //       }),
    //     })});

    // this.initSubscriptionServer(schema);
    // this.subscriptionsService.createSubscriptionServer(schema);

    consumer
      .apply(
        expressPlayground({ endpoint: '/graphql'}),
      )
      .forRoutes('/playground')
      .apply(graphqlExpress({
        schema,
        context: req => ({
          ...req,
          prisma: new Prisma({
            typeDefs: 'src/generated/prisma.graphql',
            endpoint: process.env.PRISMA_URL,
          })})}))
      .forRoutes('/graphql');
  }

  createSchema() {
    const typeDefs = this.graphQLFactory.mergeTypesByPaths('./schema/**/*.graphql');
    return this.graphQLFactory.createSchema({ typeDefs  });
  }

   
}