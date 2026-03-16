import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

// [Phase 1] 애플리케이션 전역에서 이 모듈의 Provider들을 참조할 수 있도록 설정합니다.
// 이 데코레이터 덕분에 향후 Bookmarks 등 다른 모듈에서 'imports: [PrismaModule]'을 일일이 적을 필요가 없습니다.
@Global()
@Module({
  // 이 모듈에서 관리할 Service (생성, 초기화)
  providers: [PrismaService],
  // 다른 모듈에서도 PrismaService 의존성을 주입(Inject)받아 사용할 수 있도록 외부에 노출(export)합니다.
  exports: [PrismaService],
})
export class PrismaModule {}
