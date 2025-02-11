import { Injectable } from '@nestjs/common'
import {
  EtlCommandOptions,
  IEtlManager,
  IEtlServiceReadOptions,
  IEtlServiceWriteOptions,
} from './etl.interfaces'
import { SourceManager } from '../common/source.manager'

@Injectable()
export class EtlManager extends SourceManager<
  EtlCommandOptions,
  IEtlServiceReadOptions,
  IEtlServiceWriteOptions
> {
  async _run(options: EtlCommandOptions): Promise<void> {
    this.logger.log('hello from etl ' + options)
  }
}
