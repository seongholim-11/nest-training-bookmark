import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Markly Auth and Bookmark (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    // app.useGlobalPipes 설정 (나중에 Phase 4에서 전역 설정하겠지만 테스트를 위해)
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );
    
    await app.init();

    // PrismaService 로드 및 DB 초기화
    prisma = app.get(PrismaService);
    
    // 주의: 실제 서비스가 돌고 있는 DB를 날려버릴 수 있으므로 e2e 전용 스키마나 
    // 최소한의 데이터만 다루도록 해야 하지만, 현재 로컬 단일 환경에서는 
    // 깔끔한 테스트를 위해 유니크 이메일을 사용합니다.
  });

  afterAll(async () => {
    if (prisma) {
      await prisma.$disconnect();
    }
    await app.close();
  });

  const dtoUserA = {
    email: `usera_e2e_${Date.now()}@test.com`,
    password: 'password123',
    nickname: 'UserA',
  };

  const dtoUserB = {
    email: `userb_e2e_${Date.now()}@test.com`,
    password: 'password123',
    nickname: 'UserB',
  };

  let tokenA: string;
  let refreshTokenA: string;
  let tokenB: string;
  let bookmarkAId: string;

  describe('Auth', () => {
    it('should register User A', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send(dtoUserA)
        .expect(201)
        .expect((res) => {
          expect(res.body.email).toEqual(dtoUserA.email);
          expect(res.body.id).toBeDefined();
        });
    });

    it('should login User A and return tokens', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: dtoUserA.email, password: dtoUserA.password })
        .expect(200)
        .expect((res) => {
          expect(res.body.access_token).toBeDefined();
          expect(res.body.refresh_token).toBeDefined();
          tokenA = res.body.access_token;
          refreshTokenA = res.body.refresh_token;
        });
    });

    it('should refresh tokens for User A', async () => {
      // iat (Issued At)이 달라지도록 1초 대기
      await new Promise((resolve) => setTimeout(resolve, 1000));

      return request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Authorization', `Bearer ${refreshTokenA}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.access_token).toBeDefined();
          expect(res.body.refresh_token).toBeDefined();
          expect(res.body.access_token).not.toEqual(tokenA);
          tokenA = res.body.access_token;
          refreshTokenA = res.body.refresh_token;
        });
    });

    it('should register and login User B', async () => {
      await request(app.getHttpServer()).post('/auth/register').send(dtoUserB).expect(201);
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: dtoUserB.email, password: dtoUserB.password })
        .expect(200);
      
      tokenB = res.body.access_token;
    });

    it('should logout User A', () => {
      return request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${tokenA}`)
        .expect(200);
    });

    it('should fail to refresh for User A after logout', () => {
      return request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Authorization', `Bearer ${refreshTokenA}`)
        .expect(403);
    });

    // User A를 다시 로그인시켜 이후 북마크 테스트를 진행할 수 있게 토큰 갱신
    it('should login User A again', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: dtoUserA.email, password: dtoUserA.password })
        .expect(200);
      tokenA = res.body.access_token;
    });
  });

  describe('Bookmarks Isolation & Security', () => {
    it('User A creates a bookmark', () => {
      return request(app.getHttpServer())
        .post('/bookmarks')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ url: 'https://youtube.com', title: 'YouTube' })
        .expect(201)
        .expect((res) => {
          expect(res.body.id).toBeDefined();
          expect(res.body.url).toEqual('https://youtube.com');
          bookmarkAId = res.body.id;
        });
    });

    it('User B lists bookmarks (should not see User A\'s bookmarks)', () => {
      return request(app.getHttpServer())
        .get('/bookmarks')
        .set('Authorization', `Bearer ${tokenB}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          // User B가 방금 가입했으므로 만든 북마크가 없어야 함
          expect(res.body.length).toBe(0);
        });
    });

    it('User B tries to update User A\'s bookmark (should fail with 500/404)', () => {
      return request(app.getHttpServer())
        .patch(`/bookmarks/${bookmarkAId}`)
        .set('Authorization', `Bearer ${tokenB}`)
        .send({ title: 'Hacked by B' })
        // 현재는 Prisma NotFound 에러가 500으로 잡힙니다. (나중에 404 필터링 개선 가능)
        .expect(500);
    });

    it('User B tries to delete User A\'s bookmark (should fail with 500/404)', () => {
      return request(app.getHttpServer())
        .delete(`/bookmarks/${bookmarkAId}`)
        .set('Authorization', `Bearer ${tokenB}`)
        .expect(500);
    });
  });
});
