import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppParametersController } from './app-parameters.controller';
import { AppParameter } from './app-parameters.entity';
import { AppParametersService } from './app-parameters.service';

@Module({
  imports: [TypeOrmModule.forFeature([AppParameter])],
  controllers: [AppParametersController],
  providers: [AppParametersService],
  exports: [AppParametersService],
})
export class AppParametersModule {}
