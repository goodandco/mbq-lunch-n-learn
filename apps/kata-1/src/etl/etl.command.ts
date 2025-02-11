import { Command, CommandRunner, Option } from 'nest-commander'
import { ConsoleLogger, Inject, LoggerService } from '@nestjs/common'
import { ISourceManager } from '../common/common.interfaces'
import { EtlCommandOptions } from './etl.interfaces'
import { ETL_MANAGER } from './etl.constants'

@Command({
  name: 'etl',
  description: 'etl pipeline',
})
export class EtlCommand extends CommandRunner {
  constructor(
    @Inject(ConsoleLogger) private readonly logger: LoggerService,
    @Inject(ETL_MANAGER)
    private readonly manager: ISourceManager<EtlCommandOptions>,
  ) {
    super()
  }

  async run(passedParam: string[], options?: EtlCommandOptions): Promise<void> {
    this.logger.debug({ passedParam, options })
    await this.manager.run(options)
  }

  @Option({
    flags: '-p, --pipeline [string]',
    description: 'Comma separated string like: dynamodb,filesystem,postgres',
    required: true,
  })
  parsePipeline(val: string): string {
    return val
  }

  // @Option({
  //   flags: '-pt, --pipeline-type [string]',
  //   description: 'internal | external | mixed',
  //   required: true,
  // })
  // parseTableName(val: string): string {
  //   return val;
  // }
}
