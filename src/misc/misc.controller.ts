import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Controller, Get } from "@nestjs/common";
// Handles Misc requests
@ApiTags('Misc')
@Controller()
export class MiscController {
    // Endpoint to check if the server is running
    @Get('health')
    @ApiOperation({
        summary: 'Check server health',
        description: 'Returns a simple "OK" message to indicate that the server is running.',
    })
    @ApiResponse({
        status: 200,
        description: 'Server is running.',
    })
    health(): string {
        return 'OK';
    }
    

}