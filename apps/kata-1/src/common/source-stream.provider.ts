import { Writable, Readable } from 'node:stream'
import {
  IReadStreamService,
  ISourceStreamProvider,
  IWriteStreamService,
} from './common.interfaces'

export abstract class SourceStreamProvider<TReadOptions, TWriteOptions>
  implements ISourceStreamProvider<TReadOptions, TWriteOptions>
{
  constructor(
    private readonly readStreamService: IReadStreamService<TReadOptions>,
    private readonly writeStreamService: IWriteStreamService<TWriteOptions>,
  ) {}

  abstract match(type: string): boolean

  async read(options: TReadOptions): Promise<Readable> {
    return await this.readStreamService.read(options)
  }

  async write(options: TWriteOptions): Promise<Writable> {
    return await this.writeStreamService.write(options)
  }

  async through(
    readOptions: TReadOptions,
    writeOptions: TWriteOptions,
  ): Promise<Writable> {
    return (await this.read(readOptions)).pipe(await this.write(writeOptions))
  }
}
