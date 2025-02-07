import { Command, CommandRunner, Option } from 'nest-commander'
import { ConsoleLogger, Inject, LoggerService } from '@nestjs/common'
import { IMigrationManager, MigrationCommandOptions } from './interfaces'
import { MIGRATION_MANAGER_TOKEN } from './constants'

@Command({
  name: 'migrate',
  description: 'A parameter parse',
})
export class MigrationCommand extends CommandRunner {
  constructor(
    @Inject(ConsoleLogger) private readonly loggerService: LoggerService,
    @Inject(MIGRATION_MANAGER_TOKEN)
    private readonly migrationManager: IMigrationManager,
  ) {
    super()
  }

  async run(
    passedParam: string[],
    options?: MigrationCommandOptions,
  ): Promise<void> {
    this.loggerService.debug(passedParam)
    this.loggerService.debug(options)
    await this.migrationManager.run(options)
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
