
import { Module, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshToken } from 'src/model/entities/refreshtokens.entity';
import { User } from 'src/model/entities/user.entity';
import { RefreshTokenService } from './refreshtoken.service';
import { AuthController } from './auth.controller';
import { UsersService } from '../users/users.service';
import { RefreshTokenMiddleware } from '../middleware/refreshtoken.middleware';
import { MiddlewareConsumer } from '@nestjs/common/interfaces';
@Module({
  imports: [TypeOrmModule.forFeature([RefreshToken, User])],
  providers: [RefreshTokenService, UsersService],
  controllers: [AuthController],
})
export class AuthModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RefreshTokenMiddleware).forRoutes(
      {path: 'auth/token', method: RequestMethod.GET},
      {path: 'auth/closeaccount', method: RequestMethod.DELETE},
      {path: 'auth/logout', method: RequestMethod.POST},
    );
  }
}
