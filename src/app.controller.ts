import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Authentication')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
  // This endpoint is used to check the health of the application
  // It returns a simple 'OK' response
  @ApiTags('Health Check')
  @Get('health')
  getHealth(): string {
    return 'OK'; 
  }

}
