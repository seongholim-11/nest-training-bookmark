import { PartialType } from '@nestjs/mapped-types';
import { RegisterAuthDto } from './register.dto';

export class LoginAuthDto extends PartialType(RegisterAuthDto) {}
