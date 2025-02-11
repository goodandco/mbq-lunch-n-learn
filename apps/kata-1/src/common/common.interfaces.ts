import { Readable, Writable } from 'node:stream'

export interface ISourceManager<TOptions> {
  run(options: TOptions): Promise<void>
}

export interface ISourceStreamProvider<TReadOptions, TWriteOptions> {
  match(type: string): boolean

  read(options: TReadOptions): Readable | Promise<Readable>

  write(options: TWriteOptions): Writable | Promise<Writable>

  through(
    readOptions: TReadOptions,
    writeOptions: TWriteOptions,
  ): Writable | Promise<Writable>
}

export interface IWriteStreamService<TReadOptions> {
  write(options: TReadOptions): Promise<Writable>
}

export interface IReadStreamService<TWriteOptions> {
  read(options: TWriteOptions): Promise<Readable>
}

export interface IDynamodbReadOptions {
  segment: number
  totalSegments: number
}
