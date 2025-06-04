import { ApiProperty } from "@nestjs/swagger";

export class BadResponseDto {
    @ApiProperty({description: 'Array of Error messages.', example: ['Invalid input', 'User not found']})
    message: Array<string>;
    @ApiProperty({description: 'HTTP status code.', example: [400,401, 403]})
    statusCode: number;
    @ApiProperty(({description: 'HTTP code name', example: ['Bad Request', 'Unauthorized', 'Forbidden']}))
    error: string;
}