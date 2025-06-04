import {
    IsEmail, IsNotEmpty, Length, NotContains
} from 'class-validator';

export class RegisterUserDto {
    @Length(3, 20, { message: 'Username must be between 3 and 20 characters long' })
    @NotContains('admin', { message: 'Username must not contain the word admin' })
    @NotContains('root', { message: 'Username must not contain the word root' })
    username: string;

    @IsEmail({}, { message: 'Invalid email address' })
    email: string;
    

    @IsNotEmpty({ message: 'Password is required' })
    @Length(6, 100, { message: 'Password must be at least 6 characters long' })
    password: string;
}