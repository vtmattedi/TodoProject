
import { Module } from '@nestjs/common';
import { MiscController } from './misc.controller';
@Module({
  controllers: [MiscController],
})
export class MiscModule { 
  // This module is responsible for handling miscellaneous requests
  // such as health checks or server status.
  
}
