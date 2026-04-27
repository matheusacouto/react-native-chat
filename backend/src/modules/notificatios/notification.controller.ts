import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { FirebaseAuthGuard } from '../../common/guards/firebase-auth.guard';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { SendGlobalNotificationDto } from './dto/send-global-notification.dto';
import { SendIndividualNotificationDto } from './dto/send-individual-notification.dto';
import { NotificationsService } from './notification.service';

@Controller('notifications')
@UseGuards(FirebaseAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  findAll(@Req() req: any, @Query() pagination: PaginationQueryDto) {
    return this.notificationsService.findAllByFirebaseUid(
      req.user.uid,
      pagination,
    );
  }

  @Patch('read/:recipientId')
  markAsRead(@Param('recipientId') recipientId: string) {
    return this.notificationsService.markAsRead(Number(recipientId));
  }

  @Post('individual')
  sendIndividualNotification(
    @Req() req: any,
    @Body() body: SendIndividualNotificationDto,
  ) {
    return this.notificationsService.sendIndividualNotification(
      req.user.uid,
      body.recipientId,
      body.title,
      body.description,
      body.icon,
      body.destinationRoute,
      body.payload,
    );
  }

  @Post('global')
  sendGlobalNotification(
    @Req() req: any,
    @Body() body: SendGlobalNotificationDto,
  ) {
    return this.notificationsService.sendGlobalNotification(
      req.user.uid,
      body.title,
      body.description,
      body.icon,
      body.destinationRoute,
      body.payload,
    );
  }
}
