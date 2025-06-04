import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MiddlewareConsumer, NestModule } from '@nestjs/common/interfaces';
import { Task } from 'src/model/entities/tasks.entity';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { AccessTokenMiddleware } from 'src/middleware/accesstoken.middleware';

@Module({
  imports: [TypeOrmModule.forFeature([Task])],
  providers: [TasksService],
  controllers: [TasksController],
})
export class TasksModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(AccessTokenMiddleware).forRoutes(TasksController);
    }
}