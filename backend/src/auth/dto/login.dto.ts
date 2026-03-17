import { PartialType } from '@nestjs/swagger';
import { RegisterAuthDto } from './register.dto';

export class LoginAuthDto extends PartialType(RegisterAuthDto) {}
