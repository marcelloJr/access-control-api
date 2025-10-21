import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AccessLog, AccessLogSchema } from './domain/entities/access-log.entity';
import { LogsRepository } from './infrastructure/repositories/logs.repository';
import { LogsService } from './application/services/logs.service';
import { LogsController } from './presentation/controllers/logs.controller';
import { User, UserSchema } from '@/modules/users/domain/entities/user.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AccessLog.name, schema: AccessLogSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [LogsController],
  providers: [LogsService, LogsRepository],
  exports: [LogsService],
})
export class LogsModule {}
