import { ApiProperty } from "@nestjs/swagger";
import { LoginUserDto } from "./loginuser.dto";

export class CloseAccountDto  extends LoginUserDto{
    // Added properties injected by the middleware
    // Do not use @ApiProperty here as these are not part of the request body
    userId: number;
    refreshToken: string;
}