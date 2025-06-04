import { ApiProperty } from "@nestjs/swagger";
// Basic response DTO for errors
export class BadResponseDto {
    @ApiProperty({description: 'Array of Error messages.', example: ['User not found','Invalid credentials', 'Access denied']})
    message: Array<string>;
    @ApiProperty({description: 'HTTP status code.', example: 401})
    statusCode: number;
    @ApiProperty(({description: 'HTTP code name.', example: 'Unauthorized'}))
    error: string;
}