# Migration


1. Run `docker-compose -f ./apps/kata-1/docker-compose.kata1.yaml`
2. export aws env vars

```bash
export AWS_REGION=eu-west-1
export AWS_ACCESS_KEY_ID=<your key>
export AWS_SECRET_ACCESS_KEY=<your secret>
```
3. Run `pnpm start:kata1:dev` or compile with `build` and then run `pnpm start:kata1`

Optional variables and default values:

For postgres connection: 
```typescript
host: process.env.POSTGRES_HOST || 'localhost',
port: process.env.POSTGRES_PORT || 5432,
user: process.env.POSTGRES_USER || 'admin',
password: process.env.POSTGRES_PASSWORD || 'root',
database: process.env.POSTGRES_DB_NAME || 'test_db',
```
for postgres table name:

```typescript
tableName: process.env.POSTGRES_TABLE_NAME || 'dynamo_db_table',
```

for parallel execution:

```typescript
totalSegments: process.env.MANAGER_TOTAL_SEGMENTS || 4,
```

so, by default it splits request into 4 queries. And then stores data into 4 files.
Read them in parallel as stream and pipes into the postgres using 4 connections.
