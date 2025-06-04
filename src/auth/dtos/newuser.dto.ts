import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class NewUserDto {
    accessToken: string;
    refreshToken: string;
    userId: number;
}