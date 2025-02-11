import { Command, CommandRunner, Option } from 'nest-commander'
import { ConsoleLogger, Inject, LoggerService } from '@nestjs/common'
import { MigrateCommandOptions } from './migrate.interfaces'
import { ISourceManager } from '../common/common.interfaces'
import { MIGRATE_MANAGER } from './migrate.constants'

@Command({
  name: 'migrate',
  description: 'A parameter parse',
})
export class MigrateCommand extends CommandRunner {
  constructor(
    @Inject(ConsoleLogger) private readonly loggerService: LoggerService,
    @Inject(MIGRATE_MANAGER)
    private readonly manager: ISourceManager<MigrateCommandOptions>,
  ) {
    super()
  }

  async run(
    passedParam: string[],
    options?: MigrateCommandOptions,
  ): Promise<void> {
    this.loggerService.debug({ passedParam, options })
    await this.manager.run(options)
  }

  @Option({
    flags: '-f, --from [string]',
    description: 'dynamodb | postgres | s3 | mysql | mongodb',
    required: true,
  })
  parseInputType(val: string): string {
    return val
  }

  @Option({
    flags: '-t, --to [string]',
    description: 'dynamodb | postgres | s3 | mysql | mongodb',
    required: true,
  })
  parseTableName(val: string): string {
    return val
  }
}
