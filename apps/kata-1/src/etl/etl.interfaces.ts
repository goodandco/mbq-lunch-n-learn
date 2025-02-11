export interface EtlCommandOptions {
  pipeline: string
}

export interface IEtlManager {
  run(options: EtlCommandOptions): Promise<void>
}

export interface IEtlServiceReadOptions {
  segment: number
  totalSegments: number
}

export interface IEtlServiceWriteOptions {
  segment: number
  totalSegments: number
}
