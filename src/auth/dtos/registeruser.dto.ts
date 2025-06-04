import { ApiProperty } from '@nestjs/swagger';
import {
    IsEmail, IsNotEmpty, Length, NotContains
} from 'class-validator';

export class RegisterUserDto {
    @Length(3, 20, { message: 'Username must be between 3 and 20 characters long' })
    @NotContains('admin', { message: 'Username must not contain the word admin' })
    @NotContains('root', { message: 'Username must not contain the word root' })
    @ApiProperty({
        name: 'username',
        description: 'Username for the new user.',
        required: true,
        type: String,
        example: 'john_doe',
    })
    username: string;
    @ApiProperty({
        name: 'email',
        description: 'Email for the new user, cannot use an email already registered.',
        required: true,
        type: String,
        example: 'name@provider.com',
    })
    @IsEmail({}, { message: 'Invalid email address' })
    email: string;

    @ApiProperty({
        name: 'password',
        description: 'Password for the new user, must be at least 6 characters long.',
        required: true,
        type: String,
        example: 'password123',
    })
    @IsNotEmpty({ message: 'Password is required' })
    @Length(6, 100, { message: 'Password must be at least 6 characters long' })
    password: string;
}