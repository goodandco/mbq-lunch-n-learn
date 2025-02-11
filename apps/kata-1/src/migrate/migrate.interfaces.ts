export interface MigrateCommandOptions {
  from?: string
  to?: string
}

export interface IMigrateServiceReadOptions {
  segment: number
  totalSegments: number
}

export interface IMigrateServiceWriteOptions {
  segment: number
  totalSegments: number
}
