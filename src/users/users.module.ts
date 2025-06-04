import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../model/entities/user.entity';
import { NestModule } from '@nestjs/common/interfaces';
import { RefreshToken } from '../model/entities/refreshtokens.entity';
import { RefreshTokenService } from 'src/auth/refreshtoken.service';
@Module({
  imports: [TypeOrmModule.forFeature([User, RefreshToken])],
  controllers: [],// No controllers for UsersModule
  providers: [UsersService, RefreshTokenService],
})
export class UsersModule implements NestModule {
  configure() {
    // No middleware to configure for UsersModule
  }
}