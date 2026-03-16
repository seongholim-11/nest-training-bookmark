import { Module } from '@nestjs/common';
import { BookmarksController } from './bookmarks.controller';
import { BookmarksService } from './bookmarks.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  // [Phase 1] PrismaModule을 imports 배열에 추가하여 전역(App) 트리에 등록합니다.
  // PrismaModule 자체에 @Global() 에셋이 선언되어 있으므로, 
  // 다른 모듈(Bookmarks, Auth 등)에서 이제 개별적으로 import하지 않아도 PrismaService를 주입받을 수 있습니다.
  imports: [PrismaModule],
  controllers: [BookmarksController],
  providers: [BookmarksService],
})
export class BookmarksModule {}
