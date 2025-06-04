import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Controller, Get, Res } from "@nestjs/common";
import { Response } from 'express';
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

    // If the user accesses the root path, redirect them to the API documentation
    @Get('/')
    @ApiOperation({
        summary: 'Redirects to API documentation.',
        description: 'Redirect tthe user to the API documentation (this).',
    })
    index(@Res() res: Response): void {
        res.redirect('/api');
    }
}