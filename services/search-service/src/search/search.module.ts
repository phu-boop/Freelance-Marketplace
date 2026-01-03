import { Module } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';

@Module({
    imports: [
        ElasticsearchModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                node: configService.get<string>('ELASTICSEARCH_NODE') || 'http://elasticsearch:9200',
            }),
            inject: [ConfigService],
        }),
        HttpModule,
        ConfigModule,
    ],
    providers: [SearchService],
    controllers: [SearchController],
    exports: [SearchService],
})
export class SearchModule { }
