
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as jwt from 'jsonwebtoken';
import { RefreshToken } from '../model/entities/refreshtokens.entity';
import { promisify } from 'util';
import { RefreshTokenError } from './errors/refreshtoken.error';
@Injectable()
export class RefreshTokenService {
    constructor(
        @InjectRepository(RefreshToken)
        private RefreshToken: Repository<RefreshToken>,
    ) { }

    // Issue a new access token to a user with 300 seconds expiration
    issueAcesstoken = (uid: number) => {
        if (!process.env.JWT_ACCESS_TOKEN_EXPIRES) {
            return jwt.sign({ uid: uid }, process.env.JWT_SECRET as string, { expiresIn: '300s' });
        }
        return jwt.sign({ uid: uid }, process.env.JWT_SECRET as string, { expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES });
    }

    // Issue a new refresh token to a user with 72 hours expiration
    issueRefreshToken = async (uid: number, deleteOldToken?: string | undefined) => {
        const expireTime = process.env.JWT_REFRESH_TOKEN_EXPIRES ? process.env.JWT_REFRESH_TOKEN_EXPIRES : '72h';
        const refreshToken = jwt.sign({ uid: uid }, process.env.JWT_REFRESH_SECRET as string,
            { expiresIn: expireTime });
        const saveToken = new RefreshToken();
        saveToken.token = refreshToken;
        saveToken.userId = uid;
        console.log('Issuing new refresh token to User ID: ', uid);
        await this.RefreshToken.save(saveToken); // Save the new refresh token to the database
        // If an old token is provided, delete the old token from the database
        if (deleteOldToken) {
            // If a token is provided, delete the old token from the database
            await this.RefreshToken.delete({ token: deleteOldToken });
        }
        return refreshToken; // Return the new refresh token

    }
    // Validate a refresh token by checking if it exists in the database and is not expired
    // Returns the decoded token if valid, or throws an RefreshTokenError if invalid
    validateRefreshToken = async (token: string | null) => {
        if (!token) {
            throw new RefreshTokenError('No refresh token provided');
        }
        // Check if the token exists in the database
        const existingToken = await this.RefreshToken.findOne({
            where: { token: token }
        });

        // If the token does not exist, throws a RefreshTokenError
        if (!existingToken) {
            throw new RefreshTokenError('Refresh token not found.');
        }
        try {
            const decoded = (await promisify(jwt.verify)(existingToken.token, process.env.JWT_REFRESH_SECRET as string) as { uid: number, iat: number, exp: number });
            // If the token is valid, returns the decoded token
            return decoded;
        }
        catch (err) {
            // If the token is invalid, delete it and throws a RefreshTokenError
            await this.RefreshToken.delete({ token: existingToken.token });
            throw new RefreshTokenError('Refresh token is invalid or expired. Please log in again.');
        }
    }

    // Deletes all refresh tokens for a user
    deleteAllTokensbyId = async (id: number) => {
        const result = await this.RefreshToken.delete({ userId: id });
        return result.affected; // Returns the number of tokens that were deleted
    }

    // Deletes a specific refresh token by its value
    deleteToken = async (token: string) => {
        const result = await this.RefreshToken.delete({ token: token });
        return result.affected; // Returns the number of tokens that were deleted
    }

}

