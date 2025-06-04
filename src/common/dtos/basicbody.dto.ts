
export class BasicBodyDto {
    //Properties injected by the middleware
    //Dont validate these properties
    // Do not use @ApiProperty here as these are not part of the request body
    userId: number;
}