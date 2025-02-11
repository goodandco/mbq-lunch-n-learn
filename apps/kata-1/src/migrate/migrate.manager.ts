import { pipeline } from 'node:stream/promises'
import {
  ConsoleLogger,
  Inject,
  Injectable,
  LoggerService,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ISourceStreamProvider } from '../common/common.interfaces'
import {
  IMigrateServiceReadOptions,
  IMigrateServiceWriteOptions,
  MigrateCommandOptions,
} from './migrate.interfaces'
import { SourceManager } from '../common/source.manager'
import { MIGRATE_PROVIDERS } from './migrate.constants'

@Injectable()
export class MigrateManager extends SourceManager<
  MigrateCommandOptions,
  IMigrateServiceReadOptions,
  IMigrateServiceWriteOptions
> {
  constructor(
    @Inject(ConsoleLogger) logger: LoggerService,
    @Inject(MIGRATE_PROVIDERS)
    providers: ISourceStreamProvider<
      IMigrateServiceReadOptions,
      IMigrateServiceWriteOptions
    >[],
    private readonly config: ConfigService,
  ) {
    super(logger, providers)
  }

  protected async _run({ from, to }: MigrateCommandOptions): Promise<void> {
    const totalSegments = this.config.get('manager.totalSegments')
    this.logger.debug(`Started migration from: ${from}, to: ${to}.
    Segments: ${totalSegments}`)
    const [fromProvider, toProvider] = [from, to].map((type) =>
      this.findProvider(type),
    )

    this.logger.debug(
      `From ${fromProvider.constructor.name}. To ${toProvider.constructor.name}`,
    )

    ;(
      await Promise.allSettled(
        Array.from({ length: totalSegments }).map(async (_i, segment) => {
          const options = { segment, totalSegments }
          const result = await pipeline(
            await fromProvider.read(options),
            await toProvider.write(options),
          )

          return result
        }),
      )
    ).forEach((res, i) => {
      if (res.status === 'fulfilled')
        this.logger.log(`Success for segment ${i} of ${totalSegments}`)
      else this.logger.error(`Error for segment ${i}: ${res.reason}`)
    })
  }
}
