import { IsNotEmpty, IsString } from 'class-validator';

export class LoginWithFireBaseDto {
  @IsString()
  @IsNotEmpty()
  idToken: string;
}
