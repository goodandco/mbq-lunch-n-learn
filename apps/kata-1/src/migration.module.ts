import { ConsoleLogger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MigrationCommand } from './migration.command';
import {
  DYNAMO_DB_MIGRATION_PROVIDER,
  DYNAMODB_READ_SERVICE,
  DYNAMODB_WRITE_SERVICE,
  MIGRATION_MANAGER_TOKEN,
  MIGRATION_PROVIDERS_TOKEN,
  POSTGRES_MIGRATION_PROVIDER,
  POSTGRES_READ_SERVICE,
  POSTGRES_WRITE_SERVICE,
} from './constants';
import { MigrationManager } from './migration.manager';
import { DynamoDbMigrationProvider } from './providers/provider-ddb.service';
import { PostgresMigrationProvider } from './providers/provider-postgres.service';
import { DynamodbReadService } from './services/dynamodb-read.service';
import { PostgresWriteService } from './services/postgres-write.service';

/**
 * Kata-1 is for building the Migration module
 * Basically migrating data from dynamodb to postgres (RDS)
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      load: [
        () => ({
          manager: {
            totalSegments: process.env.MANAGER_TOTAL_SEGMENTS || 4,
          },
          dynamodb: {
            tableName: 'code-kata-dummy-data',
            endpoint: 'https://dynamodb.eu-west-1.amazonaws.com',
            // for using local dynamodb outputfile (output-<segment>.json)
            useExistingFile: false,
          },
          postgres: {
            connection: {
              host: process.env.POSTGRES_HOST || 'localhost',
              port: process.env.POSTGRES_PORT || 5432,
              user: process.env.POSTGRES_USER || 'admin',
              password: process.env.POSTGRES_PASSWORD || 'root',
              database: process.env.POSTGRES_DB_NAME || 'test_db',
            },
            tableName: process.env.POSTGRES_TABLE_NAME || 'dynamo_db_table',
          },
        }),
      ],
    }),
  ],
  providers: [
    MigrationCommand,
    {
      provide: MIGRATION_MANAGER_TOKEN,
      useClass: MigrationManager,
    },
    {
      provide: DYNAMO_DB_MIGRATION_PROVIDER,
      useClass: DynamoDbMigrationProvider,
    },
    {
      provide: POSTGRES_MIGRATION_PROVIDER,
      useClass: PostgresMigrationProvider,
    },
    {
      inject: [DYNAMO_DB_MIGRATION_PROVIDER, POSTGRES_MIGRATION_PROVIDER],
      provide: MIGRATION_PROVIDERS_TOKEN,
      useFactory: (dynamoDbProvider, postgresProvider) => {
        return [dynamoDbProvider, postgresProvider];
      },
    },

    {
      provide: DYNAMODB_READ_SERVICE,
      useClass: DynamodbReadService,
    },
    {
      provide: POSTGRES_WRITE_SERVICE,
      useClass: PostgresWriteService,
    },
    {
      provide: DYNAMODB_WRITE_SERVICE,
      useValue: {
        write() {},
      },
    },
    {
      provide: POSTGRES_READ_SERVICE,
      useValue: {
        read() {},
      },
    },
    {
      provide: ConsoleLogger,
      useClass: ConsoleLogger,
    },
  ],
})
export class MigrationModule {}
