import { ConsoleLogger, Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { MigrateCommand } from './migrate.command'
import {
  DYNAMO_DB_MIGRATE_PROVIDER,
  DYNAMODB_READ_SERVICE,
  DYNAMODB_WRITE_SERVICE,
  MIGRATE_MANAGER,
  MIGRATE_PROVIDERS,
  POSTGRES_MIGRATE_PROVIDER,
  POSTGRES_READ_SERVICE,
  POSTGRES_WRITE_SERVICE,
} from './migrate.constants'
import { MigrateManager } from './migrate.manager'
import { DynamoDbStreamProvider } from './providers/dynamodb-stream.provider'
import { PostgresStreamProvider } from './providers/postgres-stream.provider'
import { DynamodbReadService } from './services/dynamodb-read.service'
import { PostgresWriteService } from './services/postgres-write.service'

/**
 * Kata-1 is for building the Migration module
 * Basically migrating data from dynamodb to postgres (RDS)
 */
@Module({
  imports: [
    ConfigModule.forFeature(() => ({
      manager: {
        totalSegments: process.env.MANAGER_TOTAL_SEGMENTS || 4,
      },
      dynamodb: {
        tableName: 'code-kata-dummy-data',
        endpoint: 'https://dynamodb.eu-west-1.amazonaws.com',
        // for using local dynamodb outputfile (output-<segment>.json)
        useExistingFile: true,
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
    })),
  ],
  providers: [
    MigrateCommand,
    {
      provide: MIGRATE_MANAGER,
      useClass: MigrateManager,
    },
    {
      provide: DYNAMO_DB_MIGRATE_PROVIDER,
      useClass: DynamoDbStreamProvider,
    },
    {
      provide: POSTGRES_MIGRATE_PROVIDER,
      useClass: PostgresStreamProvider,
    },
    {
      inject: [DYNAMO_DB_MIGRATE_PROVIDER, POSTGRES_MIGRATE_PROVIDER],
      provide: MIGRATE_PROVIDERS,
      useFactory: (dynamoDbProvider, postgresProvider) => {
        return [dynamoDbProvider, postgresProvider]
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
export class MigrateModule {}
