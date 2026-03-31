import { Controller, Get, Param } from '@nestjs/common';
import { AppParametersService } from './app-parameters.service';

@Controller('app-parameters')
export class AppParametersController {
  constructor(private readonly appParametersService: AppParametersService) {}

  @Get()
  findAll() {
    return this.appParametersService.findAll();
  }

  @Get('active')
  findActive() {
    return this.appParametersService.findActive();
  }

  @Get(':key')
  findByKey(@Param('key') key: string) {
    return this.appParametersService.findByKey(key);
  }
}
