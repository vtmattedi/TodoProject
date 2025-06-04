import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException, HttpException } from '@nestjs/common';

@Injectable()
export class authLogoutPipe implements PipeTransform {
    transform(value: any, metadata: ArgumentMetadata) {
        // Value must be a boolean string.
        // If it is not provided, it should return false.
        // If it is provided, it must match 'true' or 'false'. 
        if (value === undefined || value === null) {
            return false; // If no value is provided, return false
        }
        if (typeof value !== 'string' || !['true', 'false'].includes(value)) {
            throw new HttpException({
                message: ['Invalid \'everywhere\' value, must be \'true\' or \'false\''],
                statusCode: 400,
                error: 'Bad Request',
            }, 400);
        }
        return value === 'true'; // Convert to boolean
    }
}