import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { MigrateModule } from './migrate/migrate.module'
import { EtlModule } from './etl/etl.module'
import { CommonModule } from './common/common.module'

/**
 * Kata-1 is for building the Migration module
 * Basically migrating data from dynamodb to postgres (RDS)
 */
@Module({
  imports: [ConfigModule.forRoot(), CommonModule, MigrateModule, EtlModule],
  providers: [],
})
export class Kata1Module {}
