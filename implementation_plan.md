# Markly (개인 북마크/링크 저장소) 구현 100단계 마일스톤

이 문서는 Markly 프로젝트의 전체 구현 과정을 100단계로 세분화한 마일스톤입니다. 각 단계는 Git 브랜치별로 그룹화되어 있으며, 완료 시 체크박스를 표시합니다.

---

## 🟢 [Completed] Phase 1: Foundation & Basics
### Branch: `feat/p1-prisma-and-bookmarks`
- [x] 1. NestJS 백엔드 프로젝트 초기화
- [x] 2. Prisma 설치 및 데이터베이스 연결 설정
- [x] 3. Prisma 스키마 - `User` 모델 정의
- [x] 4. Prisma 스키마 - `Bookmark` 모델 정의
- [x] 5. Prisma 스키마 - `Tag` 모델 정의
- [x] 6. Prisma 스키마 - `BookmarkTag` N:M 관계 모델 정의
- [x] 7. 데이터베이스에 Prisma Migration 적용
- [x] 8. Prisma Client 생성
- [x] 9. `PrismaModule` 및 `PrismaService` 생성
- [x] 10. `BookmarksModule`, `Controller`, `Service` 생성
- [x] 11. `CreateBookmarkDto` 정의
- [x] 12. `PartialType`을 활용한 `UpdateBookmarkDto` 정의
- [x] 13. 북마크 CRUD - POST `/bookmarks` (생성) 구현
- [x] 14. 북마크 CRUD - GET `/bookmarks` (목록 조회) 구현
- [x] 15. 북마크 CRUD - GET `/bookmarks/:id` (단건 조회) 구현
- [x] 16. 북마크 CRUD - PATCH `/bookmarks/:id` (수정) 구현
- [x] 17. 북마크 CRUD - DELETE `/bookmarks/:id` (삭제) 구현
- [x] 18. 북마크 CRUD - PATCH `/bookmarks/:id/favorite` (즐겨찾기 토글) 구현

---

## 🔵 Phase 2: Security & Authentication
### Branch: `feat/p2-auth-system`
- [ ] 19. `@nestjs/jwt`, `@nestjs/passport`, `bcrypt`, `passport-jwt` 패키지 설치
- [ ] 20. `AuthModule`, `Controller`, `Service` 생성
- [ ] 21. `bcrypt`를 활용한 비밀번호 해싱 유틸리티 구현
- [ ] 22. `RegisterDto` 정의 (class-validator)
- [ ] 23. `AuthService`에 회원가입 로직 구현
- [ ] 24. POST `/auth/register` 엔드포인트 생성
- [ ] 25. `LoginDto` 정의
- [ ] 26. `AuthService`에 사용자 인증 및 로그인 로직 구현
- [ ] 27. `@nestjs/config` 글로벌 설정 및 JWT Secret, 만료 시간 환경 변수 처리
- [ ] 28. Access Token (15분) 발급 로직 구현
- [ ] 29. Refresh Token (7일) 발급 로직 구현
- [ ] 30. POST `/auth/login` 엔드포인트 생성
- [ ] 31. `JwtStrategy` (Access Token 검증) 구현
- [ ] 32. `JwtAuthGuard` 생성
- [ ] 33. `BookmarksController`의 모든 라우트에 `JwtAuthGuard` 적용
- [ ] 34. 북마크 CRUD 로직에서 인증된 사용자(`req.user.id`) 기준으로만 동작하도록 수정
- [ ] 35. `JwtRefreshStrategy` 구현
- [ ] 36. POST `/auth/refresh` (Access Token 재발급) 엔드포인트 생성
- [ ] 37. Refresh Token을 데이터베이스에 저장/검증하도록 User 모델 로직 업데이트
- [ ] 38. POST `/auth/logout` (Refresh Token 무효화) 엔드포인트 생성

---

## 🟡 Phase 3: Tags & Relationships
### Branch: `feat/p3-tag-system`
- [ ] 39. `TagsModule`, `Controller`, `Service` 생성
- [ ] 40. `CreateTagDto`, `UpdateTagDto` 정의
- [ ] 41. 태그 CRUD - POST `/tags` 구현
- [ ] 42. 태그 이름 유저별 중복 방지 예외 처리 구현
- [ ] 43. 태그 CRUD - GET `/tags` 구현
- [ ] 44. 태그 CRUD - PATCH `/tags/:id` 구현
- [ ] 45. 태그 CRUD - DELETE `/tags/:id` 구현
- [ ] 46. `TagsController` 밋 모든 로직에 `JwtAuthGuard` 및 User ID 검증 적용
- [ ] 47. 북마크 생성 DTO를 업데이트해 태그 목록(ID 또는 이름)을 받도록 수정
- [ ] 48. 북마크 생성 시 `prisma.$transaction`을 활용하여 북마크와 태그 동시 연결 구현
- [ ] 49. GET `/bookmarks`에 태그 정보를 포함(`include: { tags: ... }`)하여 반환
- [ ] 50. GET `/bookmarks/:id`에 태그 정보 포함하여 반환
- [ ] 51. PATCH `/bookmarks/:id`에 태그 연결 추가/삭제 기능을 트랜잭션으로 구현
- [ ] 52. GET `/bookmarks`에 태그 필터링(`?tag=`) 기능 추가
- [ ] 53. GET `/bookmarks`에 검색어 필터링(`?q=`) 기능 추가
- [ ] 54. GET `/bookmarks`에 즐겨찾기 필터링(`?favorite=true`) 기능 추가
- [ ] 55. 태그 삭제 시 연결된 북마크와의 관계(BookmarkTag)가 정상 캐스케이드(Cascade) 삭제되는지 검증

---

## 🟠 Phase 4: Refinement & Validation
### Branch: `feat/p4-global-refinement`
- [ ] 56. `class-validator` 및 `class-transformer` 모듈 체크
- [ ] 57. 전역 DTO 입력을 검증하는 `ValidationPipe` 설정 (`main.ts`)
- [ ] 58. 전역 에러 포맷을 통일할 `HttpExceptionFilter` 생성
- [ ] 59. `HttpExceptionFilter`를 애플리케이션 전역에 적용
- [ ] 60. 응답 포맷을 통일(ex: `{ success: true, data: ... }`)하는 `ResponseInterceptor` 생성
- [ ] 61. `ResponseInterceptor`를 애플리케이션 전역에 적용
- [ ] 62. 북마크 DTO(`create`, `update`) 검증 데코레이터 강화
- [ ] 63. 태그 DTO 검증 데코레이터 및 타입 체크 강화
- [ ] 64. 인증 관련 DTO의 유효성 검사 규칙 (이메일, 비밀번호 정책 등) 고도화
- [ ] 65. 잘못된 라우트 호출시 404 및 데이터 검증 실패시 400 에러 포맷 전역 동작 테스트

---

## 🟣 Phase 5: Next.js Boilerplate & Auth UI
### Branch: `feat/p5-next-boilerplate`
- [ ] 66. Next.js 14 App Router 프로젝트 스캐폴딩 생성
- [ ] 67. Tailwind CSS, Zustand, TanStack Query, 전역 설정, 및 Zod 설치
- [ ] 68. 환경 변수 설정 (`.env.local` - API Base URL)
- [ ] 69. TanStack Query를 애플리케이션 전반에 적용하기 위한 Provider 설정
- [ ] 70. Axios 또는 fetch 기반의 커스텀 HTTP Client 유틸리티 생성 (Base, Header 자동 삽입)
- [ ] 71. Zustand를 활용한 전역 Auth 상태(Store) 구성 (User 정보)
- [ ] 72. 로그인 UI 페이지(`/login`) 퍼블리싱
- [ ] 73. Zod 스키마를 붙인 로그인 폼 제출 및 API 연동
- [ ] 74. 회원가입 UI 페이지(`/register`) 퍼블리싱
- [ ] 75. Zod 스키마를 붙인 회원가입 폼 제출 및 API 연동
- [ ] 76. HTTP Client에 Access Token 재발급(Refresh) 인터셉터 로직 구현
- [ ] 77. 인증되지 않은 사용자를 리다이렉트하는 미들웨어(Middleware) 혹은 HOC 구현
- [ ] 78. 메인 애플리케이션 공통 Layout (사이드바, 헤더, 네비게이션) 구조 설계

---

## 🔴 Phase 6: Next.js Features & UX
### Branch: `feat/p6-next-logic`
- [ ] 79. 전체 북마크 목록 페이지 대시보드 UI 구현
- [ ] 80. TanStack Query를 이용해 GET `/bookmarks` 호출 및 렌더링
- [ ] 81. 개별 북마크 카드/리스트 아이템 컴포넌트 디자인 및 구현
- [ ] 82. 북마크 목록 조회 시 무한 스크롤(Infinite Scroll) 혹은 페이지네이션 연동
- [ ] 83. 새 북마크 추가를 위한 모달 폼 또는 별도 페이지 구현
- [ ] 84. URL 입력시 스크래핑된 메타데이터(타이틀, 파비콘 등) 처리 및 입력폼 자동화 UI 반영
- [ ] 85. TanStack Query의 낙관적 업데이트(Optimistic Update)를 활용한 북마크 추가 구현
- [ ] 86. 즐겨찾기 토글 별모양 버튼 구현 (낙관적 렌더링)
- [ ] 87. 북마크 삭제 기능 (확인 모달 포함) 구현
- [ ] 88. 사이드바 내에 태그 목록 및 태그 관리 UI 연동
- [ ] 89. 북마크 생성/수정 모달에 태그 Multi-Select 또는 뱃지 형태의 선택기 구현
- [ ] 90. 프론트엔드에서 새로운 태그를 즉석에서 생성하고 연결하는 동작 연동
- [ ] 91. 검색바 구현 및 상태(Zustand)에 검색어 동기화, 목록 갱신 연동
- [ ] 92. 태그 클릭 또는 즐겨찾기 필터 버튼 클릭 시 복합 필터 뷰 갱신 처리

---

## 🟤 Phase 7: Optimization & Deployment
### Branch: `feat/p7-final-polish`
- [ ] 93. 백엔드에 보안 패키지 `helmet`과 `cors` 설치 및 적용
- [ ] 94. 보안 강화를 위해 특정 오리진만 허용하도록 정교한 CORS 설정
- [ ] 95. 악성 요청 방지 및 API 사용량 제한을 위한 `@nestjs/throttler` 모듈 초기화
- [ ] 96. 인증 라우트(`/auth/*`)에 더 엄격한 Rate Limit (Throttler) 정책 적용
- [ ] 97. Next.js Server Components 및 SSR/CSR 렌더링 효율성 점검 스플릿
- [ ] 98. 데이터 변경이 적은 목록 캐싱 정책(Revalidate 등) 재정비
- [ ] 99. 전반적인 E2E 서비스 테스트 진행 (회원가입 -> 토큰 재발급 -> 북마크 CRUD -> 로그아웃)
- [ ] 100. 발견된 엣지 케이스 및 버그 픽스 후 MVP 최종 완료
