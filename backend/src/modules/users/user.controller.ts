import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { UsersService } from './user.service';
import { FirebaseAuthGuard } from '../../common/guards/firebase-auth.guard';

@Controller('users')
@UseGuards(FirebaseAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll(@Query() pagination: PaginationQueryDto) {
    return this.usersService.findAllPaginated(pagination);
  }
}
