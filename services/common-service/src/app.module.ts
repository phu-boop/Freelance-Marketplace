import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { TerminusModule } from '@nestjs/terminus';
import { CommonController } from './common.controller';
import { CommonService } from './common.service';
import { HealthController } from './health/health.controller';

@Module({
  imports: [
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 10,
    }]),
    TerminusModule,
  ],
  controllers: [CommonController, HealthController],
  providers: [CommonService],
})
export class AppModule { }
