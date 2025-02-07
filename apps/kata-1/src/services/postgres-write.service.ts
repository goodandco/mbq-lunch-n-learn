import { IWriteStreamService } from '../interfaces'
import {
  ConsoleLogger,
  Inject,
  Injectable,
  LoggerService,
} from '@nestjs/common'
import { Writable } from 'node:stream'
import { from as copyFrom } from 'pg-copy-streams'
import { Client } from 'pg'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class PostgresWriteService implements IWriteStreamService {
  constructor(
    private readonly configService: ConfigService,
    @Inject(ConsoleLogger) private readonly loggerService: LoggerService,
  ) {}

  async write(): Promise<Writable> {
    this.loggerService.debug('Writting to postgres')
    const client = new Client(this.configService.get('postgres.connection'))
    try {
      await client.connect()
      this.loggerService.debug('Connected to DB')

      const cmd = `COPY ${this.getTableName()} (${this.getTableProps().toLowerCase()}) FROM STDIN WITH (FORMAT csv, NULL 'null', DELIMITER ',', HEADER true)`
      this.loggerService.log(`Copying into postgres...`)

      const stream = client.query(copyFrom(cmd))

      stream.on('finish', async () => {
        this.loggerService.log('Copy completed')
        await client.end()
      })

      stream.on('error', async (err) => {
        this.loggerService.error('Error during COPY:', err)
        await client.end()
      })

      return stream
    } catch (err) {
      this.loggerService.error('Database connection error:', err)
      await client.end()
      throw err
    }
  }

  getTableName() {
    return this.configService.get('postgres.tableName')
  }

  getTableProps() {
    return '"PK", "SK", "addressId", "addressObjectId", "avm", "campaignState", "cancellationMotive", "cma", "created", "createdBy", "createdDate", "customerData", "customerStatus", "defaultReportId", "editedBy", "entityType", "hash", "hfa", "invitationId", "isArchived", "isFavorite", "lastModified", "lastReportDate", "lastSeen", "leadQualification", "maintenanceLevel", "modifiedDate", "onBoarded", "previousAdvisor", "propertyInfo", "reopenMotive", "reportId", "reportStatus", "reports", "searchKey", "shortHash", "state", "transferReason"'
  }
}
