import { ApiProperty } from '@nestjs/swagger';

export class BasicBodyDto {
    //Properties injected by the middleware
    //Dont validate these properties
    @ApiProperty({ description: 'User ID', example: 1 })
    userId: number;
}