import { applyDecorators, UseGuards, SetMetadata } from '@nestjs/common';
import { ApiBadRequestResponse } from '@nestjs/swagger';
import { ApiUnauthorizedResponse } from '@nestjs/swagger';
import { BadResponseDto } from 'src/common/dtos/badresponse.dto';

// This decorator is used to apply common error responses for methods that may encounter access issues
export function BadResults(): MethodDecorator & ClassDecorator {
    return applyDecorators(
        ApiBadRequestResponse({description: 'Bad payload format.', type: BadResponseDto }),
        ApiUnauthorizedResponse({ description: 'User not authenticated.', type: BadResponseDto })
    );
}