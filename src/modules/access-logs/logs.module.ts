import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AccessLog, AccessLogSchema } from './domain/entities/access-log.entity';
import { LogsRepository } from './infrastructure/repositories/logs.repository';
import { LogsService } from './application/services/logs.service';
import { LogsController } from './presentation/controllers/logs.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: AccessLog.name, schema: AccessLogSchema }])],
  controllers: [LogsController],
  providers: [LogsService, LogsRepository],
  exports: [LogsService],
})
export class LogsModule {}
