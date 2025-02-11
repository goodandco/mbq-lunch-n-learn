import { Inject, Injectable } from '@nestjs/common'
import {
  POSTGRES_READ_SERVICE,
  POSTGRES_WRITE_SERVICE,
} from '../migrate.constants'
import {
  IReadStreamService,
  IWriteStreamService,
} from '../../common/common.interfaces'
import { SourceStreamProvider } from '../../common/source-stream.provider'

@Injectable()
export class PostgresStreamProvider extends SourceStreamProvider<
  undefined,
  undefined
> {
  constructor(
    @Inject(POSTGRES_READ_SERVICE)
    readStreamService: IReadStreamService<undefined>,
    @Inject(POSTGRES_WRITE_SERVICE)
    writeStreamService: IWriteStreamService<undefined>,
  ) {
    super(readStreamService, writeStreamService)
  }

  match(type: string): boolean {
    return type === 'postgres'
  }
}
