import { MigrationModule } from './migration.module';
import { CommandFactory } from 'nest-commander';
import { ConsoleLogger } from '@nestjs/common';

async function bootstrap() {
  await CommandFactory.run(MigrationModule, {
    logger: new ConsoleLogger(),
  });
}

bootstrap();
