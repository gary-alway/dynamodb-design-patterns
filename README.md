# DynamoDB design patterns

## Prerequisites

- [docker](https://www.docker.com/)
- [awslocal-cli](https://github.com/localstack/awscli-local)

## Setup and test

```bash
yarn local:up

yarn test

# delete all data from Dynamo
yarn purge
```

## Query local Dynamo

```bash
yarn scan
yarn scan:lsi1
yarn scan:gsi1
```

## Teardown

```bash
yarn local:down
```

## Sources

- [DyanmoDB best practices](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/best-practices.html)
- [AWS re:Invent 2018: Amazon DynamoDB Deep Dive: Advanced Design Patterns for DynamoDB](https://www.youtube.com/watch?v=HaEPXoXVf2k)
- [AWS re:Invent 2019: Data modeling with Amazon DynamoDB](https://www.youtube.com/watch?v=DIQVJqiSUkE)
