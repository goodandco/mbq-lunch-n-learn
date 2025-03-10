import {
  IMigrationProvider,
  IReadStreamService,
  IWriteStreamService,
} from '../interfaces';
import { Inject, Injectable } from '@nestjs/common';
import { Writable, Readable } from 'node:stream';
import { DYNAMODB_READ_SERVICE, DYNAMODB_WRITE_SERVICE } from '../constants';

@Injectable()
export class DynamoDbMigrationProvider implements IMigrationProvider {
  constructor(
    @Inject(DYNAMODB_READ_SERVICE)
    private readonly readStreamService: IReadStreamService,
    @Inject(DYNAMODB_WRITE_SERVICE)
    private readonly writeStreamService: IWriteStreamService,
  ) {}

  match(type: string): boolean {
    return type === 'dynamodb';
  }

  async from(segment: number, totalSegments: number): Promise<Readable> {
    return this.readStreamService.read(segment, totalSegments);
  }

  async to(): Promise<Writable> {
    return this.writeStreamService.write();
  }
}
