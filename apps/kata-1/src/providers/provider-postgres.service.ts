import {
  IMigrationProvider,
  IWriteStreamService,
  IReadStreamService,
} from '../interfaces'
import { Inject, Injectable } from '@nestjs/common'
import { Writable, Readable } from 'node:stream'
import { POSTGRES_READ_SERVICE, POSTGRES_WRITE_SERVICE } from '../constants'

@Injectable()
export class PostgresMigrationProvider implements IMigrationProvider {
  constructor(
    @Inject(POSTGRES_READ_SERVICE)
    private readonly readStreamService: IReadStreamService,
    @Inject(POSTGRES_WRITE_SERVICE)
    private readonly writeStreamService: IWriteStreamService,
  ) {}

  match(type: string): boolean {
    return type === 'postgres'
  }

  async from(segment: number, totalSegments: number): Promise<Readable> {
    return this.readStreamService.read(segment, totalSegments)
  }

  async to(): Promise<Writable> {
    return this.writeStreamService.write()
  }
}
