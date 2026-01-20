import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { TerminusModule } from '@nestjs/terminus';
import { CommonController } from './common.controller';
import { CommonService } from './common.service';
import { HealthController } from './health/health.controller';

import { EventEmitterModule } from '@nestjs/event-emitter';
import { EventBusService } from './events/event-bus.service';

@Module({
  imports: [
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 10,
    }]),
    TerminusModule,
    EventEmitterModule.forRoot(),
  ],
  controllers: [CommonController, HealthController],
  providers: [CommonService, EventBusService],
  exports: [EventBusService],
})
export class AppModule { }
