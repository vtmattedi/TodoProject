import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class LoginResultDto {
    @ApiProperty({ description: 'User\'s ID.', example: 1 })
    userId: number;
    @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', description: 'Access token for the user.' })
    accessToken: string;
    @ApiPropertyOptional({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', description: 'Refresh token for the user. (only on register & login).' })
    refreshToken: string;
}