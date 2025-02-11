import { Inject, Injectable } from '@nestjs/common'
import { Writable, Readable } from 'node:stream'
import {
  DYNAMODB_READ_SERVICE,
  DYNAMODB_WRITE_SERVICE,
} from '../migrate.constants'
import {
  IReadStreamService,
  IWriteStreamService,
} from '../../common/common.interfaces'
import { SourceStreamProvider } from '../../common/source-stream.provider'
import {
  IMigrateServiceReadOptions,
  IMigrateServiceWriteOptions,
} from '../migrate.interfaces'

@Injectable()
export class DynamoDbStreamProvider extends SourceStreamProvider<
  IMigrateServiceReadOptions,
  IMigrateServiceWriteOptions
> {
  constructor(
    @Inject(DYNAMODB_READ_SERVICE)
    readStreamService: IReadStreamService<IMigrateServiceReadOptions>,
    @Inject(DYNAMODB_WRITE_SERVICE)
    writeStreamService: IWriteStreamService<IMigrateServiceWriteOptions>,
  ) {
    super(readStreamService, writeStreamService)
  }

  match(type: string): boolean {
    return type === 'dynamodb'
  }
}
