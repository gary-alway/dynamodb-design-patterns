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
yarn scan:gsi2
yarn scan:gsi3

awslocal dynamodb update-time-to-live --table-name demo --time-to-live-specification Enabled=true,AttributeName=ttl

awslocal dynamodb describe-time-to-live --table-name demo
```

## Teardown

```bash
yarn local:down
```

## Sources

- [DyanmoDB best practices](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/best-practices.html)
- [Alex DeBrie](https://www.alexdebrie.com/)
- [AWS re:Invent 2018: Amazon DynamoDB Deep Dive: Advanced Design Patterns for DynamoDB](https://www.youtube.com/watch?v=HaEPXoXVf2k)
- [AWS re:Invent 2019: Data modeling with Amazon DynamoDB](https://www.youtube.com/watch?v=DIQVJqiSUkE)
