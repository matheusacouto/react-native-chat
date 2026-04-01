import { Controller, Get, UseGuards } from '@nestjs/common';
import { UsersService } from './user.service';
import { FirebaseAuthGuard } from '../../common/guards/firebase-auth.guard';

@Controller('users')
@UseGuards(FirebaseAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }
}
