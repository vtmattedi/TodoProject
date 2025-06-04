
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../model/entities/user.entity';
import * as Crypto from 'crypto';
import { RefreshTokenService } from '../auth/refreshtoken.service'; // Assuming you have a function to create a token
import { promisify } from 'util';
import { LoginError } from './dto/login.error';
import { RegisterUserDto } from 'src/auth/dtos/registeruser.dto';
import { NewUserDto } from 'src/auth/dtos/newuser.dto';
import { RegisterError } from './dto/register.error';
@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        private refreshTokenService: RefreshTokenService, // Assuming you have a service for handling refresh tokens
    ) { }

    // Logs in a user with the provided email and password.
    // Throws a LoginError if:
    // - The user with the provided email does not exist
    // - The provided password does not match the stored password
    // Returns a NewUserDto containing the user ID, access token, and refresh token.
    async login(email: string, password: string): Promise<NewUserDto> {
        if (!email || !password) {
            throw new LoginError('Email and password are required.');
        }
        const user = await this.usersRepository.findOneBy({ email });
        if (!user) {
            throw new LoginError('User not found.');
        }
        // Hash the provided password and compare it with the stored password
        const derivedKey = (await promisify(Crypto.scrypt)(password, process.env.SCRYPT_SALT as string, 64)) as Buffer;
        if (derivedKey.toString('base64') !== user.password) {
            throw new LoginError('Invalid password.');
        }
        // Issue access and refresh tokens
        const accessToken = await this.refreshTokenService.issueAcesstoken(user.id);
        const refreshToken = await this.refreshTokenService.issueRefreshToken(user.id);
        return {
            userId: user.id,
            accessToken: accessToken,
            refreshToken: refreshToken
        };
    }
    
    // Deletes an existing user by ID
    // this will also cascade delete all tasks associated with the user
    async remove(id: number): Promise<void> {
        await this.usersRepository.delete(id);
    }

    //Create a new user with the provided registration data
    // Throws a RegisterError if:
    // - A user with the same email already exists
    // - There was an error inserting the user into the database (from typeorm)
    async create(registrationData: RegisterUserDto): Promise<NewUserDto> {
        //original idea was to try{}catch{} and if we hade already a user with the same email,
        //we would see an error with a code of '23505' which is the unique constraint violation code in PostgreSQL.
        // 
        // Alternatively, we could check if a user with the same email already exists before inserting the new user.
        // Not sure which one is better. 
        // const existingUser = await this.usersRepository.findOneBy({ email: registrationData.email });
        // if (existingUser) {
        //     throw new RegisterError('User with this email already exists');
        // }
        // Get the password from the registrationData and hash it using scrypt
        const derivedKey = (await promisify(Crypto.scrypt)(registrationData.password, process.env.SCRYPT_SALT as string, 64)) as Buffer;
        const user = new User();
        user.email = registrationData.email;
        user.username = registrationData.username;
        user.password = derivedKey.toString('base64');
        try {
            const res = await this.usersRepository.insert(user);
            const id = res.identifiers[0].id;
            // After saving the user, issue access and refresh tokens
            const accessToken = await this.refreshTokenService.issueAcesstoken(id);
            const refreshToken = await this.refreshTokenService.issueRefreshToken(id);
            return {
                userId: id,
                accessToken: accessToken,
                refreshToken: refreshToken
            };
        }

        catch (error) {
             if (error.code === '23505') {
                // unique_violation
                // https://www.postgresql.org/docs/current/errcodes-appendix.html
                throw new RegisterError('User with this email already exists.');
            }
            throw new RegisterError('Error Inserting User: ' + error.message);
        }

    }

}

