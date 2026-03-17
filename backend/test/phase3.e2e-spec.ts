import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Phase 3: Tags System (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    if (prisma) await prisma.$disconnect();
    await app.close();
  });

  const user = {
    email: `tagtest_${Date.now()}@test.com`,
    password: 'password123',
    nickname: 'TagTester',
  };

  let token: string;
  let tagId1: string;
  let tagId2: string;
  let bookmarkId: string;

  describe('Setup User', () => {
    it('should register and login', async () => {
      await request(app.getHttpServer()).post('/auth/register').send(user).expect(201);
      const res = await request(app.getHttpServer()).post('/auth/login').send({
        email: user.email,
        password: user.password,
      }).expect(200);
      token = res.body.access_token;
    });
  });

  describe('Tags CRUD', () => {
    it('should create tags', async () => {
      const res1 = await request(app.getHttpServer())
        .post('/tags')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'NestJS', color: '#ff0000' })
        .expect(201);
      tagId1 = res1.body.id;

      const res2 = await request(app.getHttpServer())
        .post('/tags')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Study' })
        .expect(201);
      tagId2 = res2.body.id;

      expect(tagId1).toBeDefined();
      expect(tagId2).toBeDefined();
    });

    it('should fail to create duplicate tag name for same user', () => {
      return request(app.getHttpServer())
        .post('/tags')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'NestJS' })
        .expect(400); // BadRequestException
    });

    it('should list user tags', async () => {
      const res = await request(app.getHttpServer())
        .get('/tags')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.some(t => t.name === 'NestJS')).toBe(true);
    });
  });

  describe('Bookmark with Tags', () => {
    it('should create bookmark with multiple tags', async () => {
      const res = await request(app.getHttpServer())
        .post('/bookmarks')
        .set('Authorization', `Bearer ${token}`)
        .send({
          url: 'https://nestjs.com',
          title: 'NestJS Official',
          tagIds: [tagId1, tagId2]
        })
        .expect(201);
      
      bookmarkId = res.body.id;
      expect(bookmarkId).toBeDefined();
    });

    it('should list bookmark including tag details', async () => {
      const res = await request(app.getHttpServer())
        .get('/bookmarks')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const bookmark = res.body.find(b => b.id === bookmarkId);
      expect(bookmark).toBeDefined();
      expect(bookmark.tags).toBeDefined();
      expect(bookmark.tags.length).toBe(2);
      // NestJS 필터 검증을 위해 include 구조 확인
      expect(bookmark.tags[0].tag.name).toBeDefined();
    });
  });

  describe('Advanced Filtering', () => {
    it('filter by tag name', async () => {
      const res = await request(app.getHttpServer())
        .get('/bookmarks')
        .query({ tag: 'NestJS' })
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0].tags.some(t => t.tag.name === 'NestJS')).toBe(true);
    });

    it('filter by search query (q)', async () => {
      const res = await request(app.getHttpServer())
        .get('/bookmarks')
        .query({ q: 'Official' })
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0].title).toContain('Official');
    });

    it('filter by favorite', async () => {
      // 먼저 즐겨찾기 토글
      await request(app.getHttpServer())
        .patch(`/bookmarks/${bookmarkId}/favorite`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const res = await request(app.getHttpServer())
        .get('/bookmarks')
        .query({ favorite: 'true' })
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0].isFavorite).toBe(true);
    });
  });
});
