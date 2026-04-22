import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { FirebaseAuthGuard } from '../../common/guards/firebase-auth.guard';
import { PushService } from './push.service';
import { RegisterPushTokenDto } from './dto/register-push-token.dto';
import { UnregisterPushTokenDto } from './dto/unregister-push-token.dto';

@Controller('push')
@UseGuards(FirebaseAuthGuard)
export class PushController {
  constructor(private readonly pushService: PushService) {}

  @Post('register-token')
  registerToken(
    @Req() req: { user: { uid: string } },
    @Body() body: RegisterPushTokenDto,
  ) {
    return this.pushService.registerToken(
      req.user.uid,
      body.token,
      body.platform,
    );
  }

  @Post('unregister-token')
  async unregisterToken(
    @Req() req: { user: { uid: string } },
    @Body() body: UnregisterPushTokenDto,
  ) {
    await this.pushService.unregisterToken(req.user.uid, body.token);

    return { success: true };
  }
}
