import {
  IMigrationManager,
  IMigrationProvider,
  MigrationCommandOptions,
} from './interfaces'
import {
  ConsoleLogger,
  Inject,
  Injectable,
  LoggerService,
} from '@nestjs/common'
import { pipeline } from 'node:stream/promises'
import { MIGRATION_PROVIDERS_TOKEN } from './constants'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class MigrationManager implements IMigrationManager {
  constructor(
    @Inject(ConsoleLogger) private readonly logger: LoggerService,
    private readonly configService: ConfigService,
    @Inject(MIGRATION_PROVIDERS_TOKEN)
    private readonly providers: IMigrationProvider[],
  ) {}

  async run({ from, to }: MigrationCommandOptions): Promise<void> {
    const start = process.hrtime()
    this.logger.debug(
      `Hello from Migration Manager. Migrating from: ${from}, to: ${to}`,
    )
    const fromProvider = this.findProvider(from)
    const toProvider = this.findProvider(to)
    const totalSegments = this.configService.get('manager.totalSegments')
    const results = await Promise.allSettled(
      Array.from({ length: totalSegments }).map(async (_i, segment) =>
        pipeline(
          await fromProvider.from(segment, totalSegments),
          await toProvider.to(),
        ),
      ),
    )
    let processedSegment = 0
    for (const result of results) {
      if (result.status === 'fulfilled') {
        this.logger.log(
          `Success for segment ${processedSegment} of ${totalSegments}`,
        )
      } else {
        this.logger.error(
          `Error for segment ${processedSegment}: ${result.reason}`,
        )
      }

      processedSegment++
    }

    const end = process.hrtime(start)
    const executionTime = (end[0] * 1e9 + end[1]) / 1e6
    this.logger.log(`Execution time: ${executionTime.toFixed(3)} ms`)

    process.exit()
  }

  findProvider(type: string): IMigrationProvider {
    const found = this.providers.find((p) => p.match(type))

    if (!found) throw new Error(`Provider with type ${type} is not found`)

    this.logger.debug(`Found provider for ${type}: ${found.constructor.name}`)

    return found
  }
}
