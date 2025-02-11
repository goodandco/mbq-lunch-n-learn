import { LoggerService } from '@nestjs/common'
import { ISourceStreamProvider } from './common.interfaces'
import { ISourceManager } from './common.interfaces'

function getExecTime(start: [number, number]): string {
  const end = process.hrtime(start)
  const execTime = end[0] + end[1] / 1e9

  return execTime.toFixed(3)
}

export abstract class SourceManager<
  TOptions,
  TSourceStreamReadOptions,
  TSourceStreamWriteOptions,
> implements ISourceManager<TOptions>
{
  constructor(
    protected readonly logger: LoggerService,
    protected readonly providers: ISourceStreamProvider<
      TSourceStreamReadOptions,
      TSourceStreamWriteOptions
    >[],
  ) {}

  async run(options: TOptions): Promise<void> {
    const start = process.hrtime()
    await this._run(options)
    this.logger.log(`Execution time: ${getExecTime(start)} sec`)
    process.exit()
  }

  protected abstract _run(options: TOptions): Promise<void>

  findProvider(
    type: string,
  ): ISourceStreamProvider<
    TSourceStreamReadOptions,
    TSourceStreamWriteOptions
  > {
    const found = this.providers.find((p) => p.match(type))
    if (!found) throw new Error(`Provider with type ${type} is not found`)

    return found
  }
}
