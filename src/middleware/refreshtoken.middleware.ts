import { HttpException, Injectable, NestMiddleware, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class RefreshTokenMiddleware implements NestMiddleware {
  // In prod we throw an error if the user is not authorized
  // and do not speficy the error message
  productionResult() {
    if (process.env.NODE_ENV !== 'development') {
      throw new HttpException({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: ['Unauthorized'],
        error: 'Unauthorized',
      }, HttpStatus.UNAUTHORIZED);
    }
    return;
  }
  use(req: Request, res: Response, next: () => void) {
    // Check if the request has an authorization header
    if (!req.headers.authorization) {
      this.productionResult();
      throw new HttpException({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: ['No authorization header provided.'],
        error: 'Unauthorized'
      }, HttpStatus.UNAUTHORIZED);
    }
    // Check if the authorization header starts with 'Bearer '
    if (!req.headers.authorization.startsWith('Bearer ')) {
      this.productionResult();
      throw new HttpException({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: ['Authorization header must start with \'Bearer \'.'],
        error: 'Unauthorized'
      }, HttpStatus.UNAUTHORIZED);
    }
    // Extract the token from the authorization header
    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
      this.productionResult();
      throw new HttpException({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: ['Refresh Token not provided in authorization header.'],
        error: 'Unauthorized'
      }, HttpStatus.UNAUTHORIZED);
    }
    // Verify the token
    jwt.verify(token, process.env.JWT_REFRESH_SECRET as string, (err: any, decoded: any) => {
      if (err) {
        this.productionResult();
        throw new HttpException({
          statusCode: HttpStatus.UNAUTHORIZED,
          message: ['Refresh Token Invalid or expired.'],
          error: 'Unauthorized'
        }, HttpStatus.UNAUTHORIZED);
      }
      // Attach the userId to the request body
      const { uid } = decoded;
      req.body.userId = uid;
      req.body.refreshToken = token;
    //   console.log('\t\tRefreshTokenMiddleware: Refresh token valid, userId:', uid, 'refreshToken:', token);
      if (next)
        next();
    }
    );
  }
}
