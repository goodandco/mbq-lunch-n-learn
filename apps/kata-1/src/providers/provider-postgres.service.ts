import {
  IMigrationProvider,
  IWriteStreamService,
  IReadStreamService,
} from '../interfaces'
import { Inject, Injectable } from '@nestjs/common'
import { Writable, Readable } from 'node:stream'
import { POSTGRES_READ_SERVICE, POSTGRES_WRITE_SERVICE } from '../constants'

class MyWritable extends Writable {
  _write(chunk, encoding, callback) {
    console.log(`[${new Date().toISOString()}] ${chunk.toString()}`)
    callback()
  }
}

function getWriteStream() {
  const stream = new MyWritable()
  setTimeout(() => {
    stream.write('Writing data to postgres')
    stream.end('Ending writing')
  }, 100)

  return stream
}

function getReadStream() {
  const stream = new Readable()

  setTimeout(() => {
    stream.emit('data', 'Hello data!')
    stream.emit('end')
  }, 100)

  return stream
}

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
