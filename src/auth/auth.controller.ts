import { Body, Controller, Get, Post, Req, Res, UsePipes, ValidationPipe, Query, Delete, ParseBoolPipe } from '@nestjs/common';
import { HttpException, HttpStatus } from '@nestjs/common';
import { query, Request, Response } from 'express';
import { LoginUserDto } from './dtos/loginuser.dto';
import { RegisterUserDto } from './dtos/registeruser.dto';
import { RefreshTokenService } from './refreshtoken.service';
import { LoginResultDto } from './dtos/loginresult.dto';
import { UsersService } from '../users/users.service';
import { LoginError } from '../users/errors/login.error';
import { authLogoutPipe } from './pipes/authlogout.pipes';
import { RegisterError } from 'src/users/errors/register.error';
import { RefreshTokenError } from './errors/refreshtoken.error';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { BadResults } from '../common/decorators/badresponse.decorator';
import { BadAccessResult } from '../common/decorators/badaccess.decorator';

// Handles all authentication related requests
@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
    constructor(private refreshTokenService: RefreshTokenService
        ,
        private readonly usersService: UsersService
    ) {
        //injected dependencies
    }

    defaultErrorHandler(error: Error): void {
        if (error instanceof HttpException) {
            // If an HttpException is thrown, re-throw it
            // let NestJS handle it by returning the error response
            throw error;
        }
        console.warn('error occurred:', error.constructor.name);
        if (process.env.LOG_ROUTING_ERRORS === 'true') {
            // If we want to log non HttpExceptions
            // This is useful for debugging purposes
            console.error(error);
        }
        if (error instanceof LoginError) {
            console.warn('Login error:', error.message);
            if (process.env.NODE_ENV === 'development') {
                throw new HttpException({
                    message: [error.message],
                    statusCode: HttpStatus.UNAUTHORIZED,
                    error: 'Unauthorized',
                }, HttpStatus.UNAUTHORIZED);
            }
            // In production, we do not reveal the error message
            else {
                throw new HttpException({
                    status: HttpStatus.UNAUTHORIZED,
                    error: 'Unauthorized',
                }, HttpStatus.UNAUTHORIZED);
            }
        }
        else if (error instanceof RegisterError) {
            console.warn('Registration error:', error.message);
            // Registration Error do not contain daming information.
            throw new HttpException({
                message: [error.message],
                statusCode: HttpStatus.BAD_REQUEST,
                error: 'Bad Request',
            }, HttpStatus.BAD_REQUEST);
        }

        else if (error instanceof RefreshTokenError) {
            console.warn('Refresh token error:', error.message);
            // Hide the error message in production?
            throw new HttpException({
                message: [error.message],
                statusCode: HttpStatus.UNAUTHORIZED,
                error: 'Unauthorized',
            }, HttpStatus.UNAUTHORIZED);
        }

        else {
            console.warn('An unexpected error occurred:', error);
            if (process.env.DONT_RECOVER_FROM_ERROR === 'true') {
                // If we do not want to recover from the error
                // rethrow it
                // This should not be capture by nestJS
                throw error;
            }
            // This is capture by nestJS
            throw new HttpException({
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                error: 'An unexpected error occurred',
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }

    // Logs in a user with the provided email and password
    // If successful, it returns the userId and accessToken
    // And sets the refresh token in the response s
    @Post('/login')
    @ApiOperation({ summary: 'Logs in a user.', description: 'Attempts to log in a user using the credentials provided.' })
    @BadResults()
    @ApiResponse({ status: HttpStatus.OK, description: 'User logged in successfully.', type: LoginResultDto })
    @UsePipes(new ValidationPipe())
    async login(@Body() body: LoginUserDto, @Res({ passthrough: true }) response: Response): Promise<LoginResultDto> {
        try {
            const res = await this.usersService.login(body.email, body.password);
            console.log('User logged in with id:', res.userId);

            response.status(HttpStatus.OK);
            // Return the userId and accessToken
            return {
                userId: res.userId,
                accessToken: res.accessToken,
                refreshToken: res.refreshToken,
            }
        }
        catch (error) {
            console.warn('Error during user login.', error instanceof LoginError ? 'invalid credentials.' : '');
            this.defaultErrorHandler(error);
        }

    }
    // Registers a new user with the provided registration data
    // If successful, it returns the userId, accessToken and refreshToken
    @Post('/register')
    @ApiOperation({ summary: 'Register a new in a user.', description: 'Registers a new user with the credentials provided. if successful will also login the user.' })
    @UsePipes(new ValidationPipe())
    @BadResults()
    @ApiResponse({ status: HttpStatus.CREATED, description: 'Creates user account and login.', type: LoginResultDto })
    async register(@Body() body: RegisterUserDto, @Res({ passthrough: true }) response: Response): Promise<LoginResultDto> {

        console.log('Registering user with data:', body.email, body.username);
        try {
            const res = await this.usersService.create(body)
            console.log('User registered with id:', res.userId);
            response.status(HttpStatus.CREATED);
            return {
                userId: res.userId,
                accessToken: res.accessToken,
                refreshToken: res.refreshToken,
            };
        }
        catch (error) {
            console.warn('Error during user registration.', error instanceof RegisterError ? 'invalid registration data' : '');
            this.defaultErrorHandler(error);
        }
    }

    // Logs out the user, deletes the refresh token from the database
    // If the query parameter 'everywhere' is set to true, it will delete all refresh tokens for the user
    // Invalidating all sessions of the user
    @Post('/logout')
    @ApiOperation({ summary: 'Invalidate a users session.', description: 'Logs out a user using the refreshToken provided. Can logout all the user from all devices.' })
    @ApiBearerAuth()
    @BadResults()
    @ApiQuery({
        name: 'everywhere',
        description: 'If set to true, will log out from all devices. Default is false.',
        example: '',
        required: false,
        type: Boolean,
    })
    @ApiResponse({ status: HttpStatus.OK, description: 'Successfully logged out.', example: { message: 'Logged out successfully from 1 devices', everywhere: false } })
    async logout(@Body() body: { userId: number, refreshToken: string }, @Query('everywhere', authLogoutPipe) everywhere: boolean, @Res({ passthrough: true }) response: Response): Promise<any> {
        //If there is a query parameter 'everywhere' and it is 'true'
        //logout all devices with this user's id
        const refreshToken = body.refreshToken;
        console.log('Logout attempt by user: ', body.userId, 'All sessions:', everywhere);
        try {
            const decoded = await this.refreshTokenService.validateRefreshToken(refreshToken);
            let affected = -1;
            if (everywhere)
                affected = await this.refreshTokenService.deleteAllTokensbyId(decoded.uid);// Clear all refresh tokens for the user
            else
                affected = await this.refreshTokenService.deleteToken(refreshToken); // Clear the specific refresh token from the database
            console.log('Logout affected rows:', affected, 'User ID:', decoded.uid);
            return {
                message: `Logged out successfully from ${affected} devices`,
                everywhere: everywhere
            }
        }
        catch (error) {
            console.warn('Error during logout:', error);
            this.defaultErrorHandler(error);
        }
    }

    // Refreshes the access token using the refresh token
    @Get('/token')
    @ApiOperation({ summary: 'Generates a new accessToken.', description: 'Generates a new accessToken using the refreshToken.' })
    @ApiBearerAuth()
    @BadAccessResult()
    @ApiResponse({ status: HttpStatus.OK, description: 'New Access Token Granted.', type: LoginResultDto })
    async token(@Body() body: { userId: number, refreshToken: string }): Promise<any> {
        const refreshToken = body.refreshToken;
        console.log('\x1b[1mToken refresh attempt with user ID:\x1b[0m', body.userId, 'Refresh Token:', refreshToken);
        try {
            const decoded = await this.refreshTokenService.validateRefreshToken(refreshToken);
            const accessToken = await this.refreshTokenService.issueAcesstoken(decoded.uid);
            return {
                userId: decoded.uid,
                accessToken: accessToken,
            };
        }
        catch (error) {
            this.defaultErrorHandler(error);
        }

    }

    // Closes the user account and deletes all user's data
    @Delete('/closeaccount')
    @ApiOperation({ summary: 'Permenently closes an account.', description: 'Permenently closes an account based on the Id of the refreshToken and the user\'s credential. The credentials need to match the user\'s id of the token. This deletes all data of the users in the DB including valid refreshTokens and Tasks.' })
    @UsePipes(new ValidationPipe())
    @ApiBearerAuth()
    @ApiBody({
        type: LoginUserDto
    })
    @BadAccessResult()
    @ApiResponse({ status: HttpStatus.OK, description: 'Closes User\'s account and deletes his data from DB.', type: LoginResultDto })
    async closeAccount(@Req() request: Request, @Body() body: { refreshToken: string } & LoginUserDto, @Res({ passthrough: true }) response: Response): Promise<any> {
        console.log('Close account attempt with email:', body.email);
        // Delete all refresh tokens for the user
        try {
            const userData = await this.usersService.login(body.email, body.password);
            const decoded = await this.refreshTokenService.validateRefreshToken(body.refreshToken);
            if (decoded.uid !== userData.userId) {
                throw new RefreshTokenError('Refresh token does not match the user ID');
            }
            // This will also delete all tasks associated with the user
            // and all refresh tokens associated with the user
            await this.usersService.remove(decoded.uid);
            response.status(HttpStatus.OK);
            console.log('Account closed successfully for user ID:', decoded.uid);
            return { message: 'Account closed successfully. All account data were deleted , All Sessions were invalidated.', userId: decoded.uid };
        }
        catch (error) {
            console.warn('Error closing account.');
            this.defaultErrorHandler(error);
        }
    }

}