import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './model/entities/user.entity';
import { RefreshToken } from './model/entities/refreshtokens.entity';
import { Task } from './model/entities/tasks.entity';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { TasksModule } from './tasks/tasks.module';
@Module({
  imports: [ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.PGHOST,
      port: process.env.PGPORT ? parseInt(process.env.PGPORT) : 5432,
      username: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      database: process.env.PGDATABASE,
      entities: [User, RefreshToken, Task],
      ssl: process.env.PGSSL === 'true' ? true : false,
      synchronize: true,
    }),
    AuthModule,
    TasksModule,
    UsersModule,
  ],
})
export class AppModule { }
