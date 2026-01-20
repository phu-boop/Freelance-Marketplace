import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ForumService } from './forum.service';
import { ForumController } from './forum.controller';

@Module({
    imports: [HttpModule],
    providers: [ForumService],
    controllers: [ForumController],
    exports: [ForumService],
})
export class ForumModule { }
