import { ConsoleLogger, Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { EtlManager } from './etl.manager'
import { EtlCommand } from './etl.command'
import { ETL_MANAGER } from './etl.constants'

/**
 * Kata-1 is for building the Migration module
 * Basically migrating data from dynamodb to postgres (RDS)
 */
@Module({
  imports: [
    // ConfigModule.forFeature(() => ({
    //   etl: {
    //     manager: {
    //       totalSegments: process.env.MANAGER_TOTAL_SEGMENTS || 4,
    //     },
    //     dynamodb: {
    //       tableName: 'code-kata-dummy-data',
    //       endpoint: 'https://dynamodb.eu-west-1.amazonaws.com',
    //       // for using local dynamodb outputfile (output-<segment>.json)
    //       useExistingFile: false,
    //     },
    //     postgres: {
    //       connection: {
    //         host: process.env.POSTGRES_HOST || 'localhost',
    //         port: process.env.POSTGRES_PORT || 5432,
    //         user: process.env.POSTGRES_USER || 'admin',
    //         password: process.env.POSTGRES_PASSWORD || 'root',
    //         database: process.env.POSTGRES_DB_NAME || 'test_db',
    //       },
    //       tableName: process.env.POSTGRES_TABLE_NAME || 'dynamo_db_table',
    //     },
    //   },
    // })),
  ],
  providers: [
    // EtlCommand,
    // {
    //   provide: ETL_MANAGER,
    //   useClass: EtlManager,
    // },
    // {
    //   provide: ConsoleLogger,
    //   useClass: ConsoleLogger,
    // },
  ],
})
export class EtlModule {}
