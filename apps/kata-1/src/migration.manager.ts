import {
  IMigrationManager,
  IMigrationProvider,
  MigrationCommandOptions,
} from './interfaces';
import {
  ConsoleLogger,
  Inject,
  Injectable,
  LoggerService,
} from '@nestjs/common';
import { pipeline } from 'node:stream/promises';
import { MIGRATION_PROVIDERS_TOKEN } from './constants';
import { ConfigService } from '@nestjs/config';

function getExecTime(start: [number, number]): string {
  const end = process.hrtime(start);
  const execTime = end[0] + end[1] / 1e9;

  return execTime.toFixed(3);
}

@Injectable()
export class MigrationManager implements IMigrationManager {
  constructor(
    @Inject(ConsoleLogger) private readonly logger: LoggerService,
    private readonly config: ConfigService,
    @Inject(MIGRATION_PROVIDERS_TOKEN)
    private readonly providers: IMigrationProvider[],
  ) {}

  async run({ from, to }: MigrationCommandOptions): Promise<void> {
    const start = process.hrtime();
    const totalSegments = this.config.get('manager.totalSegments');
    this.logger.debug(`Started migration from: ${from}, to: ${to}.
    Segments: ${totalSegments}`);
    const [fromProvider, toProvider] = [from, to].map((type) =>
      this.findProvider(type),
    );
    (
      await Promise.allSettled(
        Array.from({ length: totalSegments }).map(async (_i, segment) => {
          const result = await pipeline(
            await Promise.all([
              fromProvider.from(segment, totalSegments),
              toProvider.to(),
            ]),
          );

          if (totalSegments > 1)
            this.logger.log(
              `Segment ${segment} exec time ${getExecTime(start)}`,
            );

          return result;
        }),
      )
    ).forEach((res, i) => {
      if (res.status === 'fulfilled')
        this.logger.log(`Success for segment ${i} of ${totalSegments}`);
      else this.logger.error(`Error for segment ${i}: ${res.reason}`);
    });

    this.logger.log(`Execution time: ${getExecTime(start)} sec`);

    process.exit();
  }

  findProvider(type: string): IMigrationProvider {
    const found = this.providers.find((p) => p.match(type));

    if (!found) throw new Error(`Provider with type ${type} is not found`);

    this.logger.debug(`Found provider for ${type}: ${found.constructor.name}`);

    return found;
  }
}
