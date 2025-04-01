import { Module } from '@nestjs/common';
import { HelloWorldService } from './hello-world.service';
import { HelloWorldController } from './hello-world.controller';

@Module({
  providers: [HelloWorldService],
  controllers: [HelloWorldController],
})
export class HelloWorldModule {}
