import { Writable } from 'node:stream';
import { Client } from 'pg';
import { from as copyFrom } from 'pg-copy-streams';
import {
  ConsoleLogger,
  Inject,
  Injectable,
  LoggerService,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IWriteStreamService } from '../interfaces';

@Injectable()
export class PostgresWriteService implements IWriteStreamService {
  constructor(
    private readonly configService: ConfigService,
    @Inject(ConsoleLogger) private readonly loggerService: LoggerService,
  ) {}

  async write(): Promise<Writable> {
    this.loggerService.log('Writing to postgres...');
    const client = new Client(this.configService.get('postgres.connection'));
    try {
      await client.connect();
      const copyCommand = `COPY ${this.getTableName()} (${this.getTableProps().toLowerCase()}) FROM STDIN WITH (FORMAT csv, NULL 'null', DELIMITER ',', HEADER true)`;
      const stream = client.query(copyFrom(copyCommand));

      stream.on('finish', async () => {
        this.loggerService.log('COPY completed');
        await client.end();
      });

      stream.on('error', async (err) => {
        this.loggerService.error('Error during COPY:', err);
        await client.end();
      });

      return stream;
    } catch (err) {
      this.loggerService.error('Database connection error:', err);
      await client.end();
      throw err;
    }
  }

  getTableName() {
    return this.configService.get('postgres.tableName');
  }

  getTableProps() {
    return '"PK", "SK", "addressId", "addressObjectId", "avm", "campaignState", "cancellationMotive", "cma", "created", "createdBy", "createdDate", "customerData", "customerStatus", "defaultReportId", "editedBy", "entityType", "hash", "hfa", "invitationId", "isArchived", "isFavorite", "lastModified", "lastReportDate", "lastSeen", "leadQualification", "maintenanceLevel", "modifiedDate", "onBoarded", "previousAdvisor", "propertyInfo", "reopenMotive", "reportId", "reportStatus", "reports", "searchKey", "shortHash", "state", "transferReason"';
  }
}
