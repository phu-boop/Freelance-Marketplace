import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { HelpService } from './help.service';
import { HelpController } from './help.controller';

@Module({
    imports: [HttpModule],
    providers: [HelpService],
    controllers: [HelpController],
    exports: [HelpService],
})
export class HelpModule { }
