import { CommandFactory } from 'nest-commander'
import { ConsoleLogger } from '@nestjs/common'
import { Kata1Module } from './kata-1.module'

async function bootstrap() {
  await CommandFactory.run(Kata1Module, {
    logger: new ConsoleLogger(),
  })
}

bootstrap()
