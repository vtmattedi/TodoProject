import { ApiProperty } from "@nestjs/swagger";

export class LoginResultDto {
    @ApiProperty({ description: 'User ID', example: 1 })
    userId: number;
    @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', description: 'Access token for the user' })
    accessToken: string;
    @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', description: 'Refresh token for the user' })
    refreshToken: string;
}