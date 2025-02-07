import { Writable, Readable } from 'node:stream'

export interface MigrationCommandOptions {
  from?: string
  to?: string
}

export interface IMigrationProvider {
  match(type: string): boolean

  from(segment: number, totalSegments: number): Readable | Promise<Readable>

  to(): Writable | Promise<Writable>
}

export interface IMigrationManager {
  run(options: MigrationCommandOptions): Promise<void>
}

export type IMigrationServiceOptions = {
  fromType: 'dynamodb' | 'postgres' | 's3' | 'documentdb'
  toType: 'dynamodb' | 'postgres' | 's3' | 'documentdb'
}

export interface IMigrationService {
  configure(options: IMigrationServiceOptions): Promise<void>

  start(tableFrom: string, tableTo: string): Promise<void>
}

export interface IWriteStreamService {
  write(): Promise<Writable>
}

export interface IReadStreamService {
  read(segment: number, totalSegments: number): Promise<Readable>
}
