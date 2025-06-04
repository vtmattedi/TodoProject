import { ApiProperty } from '@nestjs/swagger';
import {
    IsEmail, IsNotEmpty, Length
} from 'class-validator';

export class LoginUserDto {
    @ApiProperty({description: 'User email address', example: 'user@provider.com'})
    @IsNotEmpty({ message: 'Email is Required' })// Do not validate email format here
    email: string;

    @ApiProperty({example: 'password123', description: 'User password'})
    @IsNotEmpty({ message: 'Password is required' })// Do not validate password length here
    password: string;
}