import { ApiProperty } from "@nestjs/swagger";
import { LoginUserDto } from "./loginuser.dto";

export class CloseAccountDto  extends LoginUserDto{
    // Add properties injected by the middleware
    @ApiProperty({ description: 'User ID', example: 1 })
    userId: number;
    @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', description: 'Access token for the user' })
    refreshToken: string;
}