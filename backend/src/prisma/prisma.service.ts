import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
// 자동 생성된 Prisma Client를 불러옵니다. (schema.prisma의 커스텀 output 디렉토리를 바라봅니다)
import { PrismaClient } from '../../generated/prisma/client.js';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  // [Phase 1] NestJS 애플리케이션 구동이 완료될 때(OnModuleInit) 
  // 자동으로 이 메서드가 실행되어 DB 커넥션 풀을 생성합니다.
  async onModuleInit() {
    await this.$connect();
  }

  // [Phase 1] 애플리케이션이 종료될 때(OnModuleDestroy) 
  // 안전하게 데이터베이스와의 연결을 해제하고 자원을 반납합니다.
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
