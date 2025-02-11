import { Writable } from 'node:stream'
import { Client } from 'pg'
import { from as copyFrom } from 'pg-copy-streams'
import {
  ConsoleLogger,
  Inject,
  Injectable,
  LoggerService,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { IWriteStreamService } from '../../common/common.interfaces'

@Injectable()
export class PostgresWriteService implements IWriteStreamService<undefined> {
  constructor(
    private readonly config: ConfigService,
    @Inject(ConsoleLogger) private readonly logger: LoggerService,
  ) {}

  async write(): Promise<Writable> {
    this.logger.log('Writing to postgres...')
    const connection = this.config.get('postgres.connection')
    const client = new Client(connection)
    try {
      await client.connect()
      const copyCommand = `COPY ${this.getTableName()} (${this.getTableProps().toLowerCase()}) FROM STDIN WITH (FORMAT csv, NULL 'null', DELIMITER ',', HEADER true)`
      const stream = client.query(copyFrom(copyCommand))
      this.logger.debug('Strated copying.')
      stream.on('finish', async () => {
        await client.end()
      })

      stream.on('error', async (err) => {
        this.logger.error('Error during COPY:', err)
        await client.end()
      })

      return stream
    } catch (err) {
      this.logger.error('Database connection error:', err)
      await client.end()
      throw err
    }
  }

  getTableName() {
    return this.config.get('postgres.tableName')
  }

  getTableProps() {
    return '"PK", "SK", "addressId", "addressObjectId", "avm", "campaignState", "cancellationMotive", "cma", "created", "createdBy", "createdDate", "customerData", "customerStatus", "defaultReportId", "editedBy", "entityType", "hash", "hfa", "invitationId", "isArchived", "isFavorite", "lastModified", "lastReportDate", "lastSeen", "leadQualification", "maintenanceLevel", "modifiedDate", "onBoarded", "previousAdvisor", "propertyInfo", "reopenMotive", "reportId", "reportStatus", "reports", "searchKey", "shortHash", "state", "transferReason"'
  }
}
