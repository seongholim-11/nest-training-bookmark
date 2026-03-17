import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { BookmarksModule } from './bookmarks/bookmarks.module';
import { AuthModule } from './auth/auth.module';

@Module({
  // [Phase 1] PrismaModule을 imports 배열에 추가하여 전역(App) 트리에 등록합니다.
  // PrismaModule 자체에 @Global() 에셋이 선언되어 있으므로, 
  // 다른 모듈(Bookmarks, Auth 등)에서 이제 개별적으로 import하지 않아도 PrismaService를 주입받을 수 있습니다.
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    BookmarksModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
