# Markly Project TIL (Today I Learned)

## 📅 2026-03-16: Foundation & Security (Phase 1, 2)
### ✅ 주요 학습 내용
- NestJS 프로젝트 초기 설정 및 Prisma 연동
- JWT를 활용한 인증 시스템 구축 (Access/Refresh Token)
- Bcrypt를 이용한 비밀번호 암호화 및 유저 격리 보안 구현
- Custom Decorator (`@GetUser`) 생성 및 활용

### ❓ Self-Check Questions (Deep Dive)

#### [Architecture & Prisma]
1. **Prisma Schema**: `User`와 `Bookmark` 사이의 1:N 관계를 정의할 때 `@relation`과 `onDelete: Cascade`의 역할은 무엇인가요?
> @relation은 어떤 모델과 어떻게 관계를 설정할 것인지 정의할 때, 사용하는 속성
> onDelete: Cascade는 예를 들어 User 데이터가 삭제되면 자동으로 Bookmark 데이터도 삭제하는 속성

✅ **피드백**: 정확합니다! 두 개념 모두 정확히 이해하고 있습니다.
📖 **정답**: `@relation`은 두 모델 사이의 관계를 Prisma에게 알려주는 속성으로, `fields`(외래키), `references`(참조 대상 키)를 통해 어떤 필드가 어떤 모델의 어떤 키를 참조하는지 명시합니다. `onDelete: Cascade`는 부모(예: User)가 삭제될 때 연결된 모든 자식(예: Bookmark) 데이터도 함께 자동으로 삭제하는 동작을 정의합니다. 이를 통해 서버에서 별도의 삭제 로직 없이 DB 수준에서 데이터 무결성을 보장할 수 있습니다.

---

2. **Prisma Client**: `npx prisma generate` 명령어가 실제로 프로젝트 내에서 어떤 역할을 수행하며, 왜 모델 수정 후 매번 실행해야 하나요?
> Prisma client를 생성하기 위해 수행
> 모델이 달라지면 Prisma client도 수정되어야 하기 때문에, 명령어를 실행하고 Prisma client를 재생성함.

Prisma Client는 Prisma가 schema.prisma 파일을 읽고 자동으로 생성해주는 타입 세이프(Type-safe) 데이터베이스 쿼리 라이브러리입니다.
✅ **피드백**: 핵심을 잘 짚었습니다. 한 가지 더 보충하면, 이 생성된 Client가 코드 자동완성(IntelliSense)에도 영향을 줍니다.
📖 **정답**: `npx prisma generate`는 `schema.prisma` 파일을 읽어 TypeScript 타입이 완벽하게 맞도록 Prisma Client 코드를 `node_modules/@prisma/client` 안에 자동 생성합니다. 모델을 수정하면 DB 구조가 바뀌는 것이므로, 변경된 모델에 맞는 새로운 타입의 Client를 재생성하지 않으면 `prisma.newModel.findMany()`처럼 새로 추가된 모델에 대한 TypeScript 자동완성이 되지 않고 타입 에러가 발생합니다.

---

3. **Database Migration**: `npx prisma migrate dev`와 `npx prisma db push`의 차이점은 무엇이며, 협업 시에는 어떤 방식을 권장하나요?
> npx prisma migrate dev는 임시로 적용함.
> npx prism db push는 실제 db에 적용됨.
> 그래서 협업 시 npx prisma migrate dev로 테스트를 하고 npx prisma db push로 실제 적용해야 함.

❌ **피드백**: 반대로 이해하고 있습니다! 실제로는 두 명령어의 역할이 반대입니다. 협업에서 `db push`를 사용하면 팀원들이 변경 이력을 추적할 수 없어 매우 위험합니다.
📖 **정답**:
- `npx prisma migrate dev`: **이력을 남기는 방식**. 변경 사항을 SQL 마이그레이션 파일(`migrations/` 폴더)로 생성하고 DB에 적용합니다. 이 파일은 Git으로 관리되어 팀원들이 동일한 변경 이력을 공유할 수 있습니다. **협업 시 이 방법이 표준**입니다.
- `npx prisma db push`: **이력 없이 스키마를 그냥 밀어 넣는 방식**. 마이그레이션 파일을 생성하지 않고 바로 DB 구조를 변경합니다. 이력 추적이 불가능해 **초기 개발/프로토타이핑에만 적합**하며 협업에서는 위험합니다.

---

#### [Authentication & Security]
4. **JWT Flow**: 로그인 시 발급되는 `access_token`과 `refresh_token`의 유효기간이 왜 달라야 하며, 보안상 각각 어디에 저장되는 것이 유리할까요?
> access_token은 요청할 때마다 확인하는 중요한 값이기 때문에 15분 정도로 유효기간이 짧아야 하고, 서버 내에 저장됨.
> refresh_token은 access_token이 만료될 때, 재발급하기 위한 토큰으로 유효기간이 길고, DB 내에 저장됨.

🔶 **피드백**: 유효기간의 이유와 Refresh Token의 DB 저장은 정확합니다. 다만 Access Token의 보관 위치에 대한 설명이 아쉽습니다. Access Token은 서버가 아닌 **클라이언트(브라우저)**가 들고 있습니다.
📖 **정답**:
- **Access Token**: 유효기간이 짧아야(15분) 탈취되더라도 빠르게 만료되어 피해를 최소화합니다. 클라이언트(브라우저) 측의 **메모리(JavaScript 변수)**에 저장하는 것이 가장 안전합니다. (localStorage는 XSS 공격에 취약)
- **Refresh Token**: Access Token 재발급용으로 오래 쓰이므로(7일) 유효기간이 깁니다. 클라이언트에서는 **HttpOnly Cookie**에 저장하여 JavaScript로 접근 불가능하게 만드는 것이 안전하며, 서버 측 DB에도 해시화하여 저장합니다.

---

5. **Passport**: `JwtStrategy`에서 `validate` 메서드가 반환하는 객체는 NestJS의 어디에(`req.user` 등) 저장되며, 이를 컨트롤러에서 어떻게 꺼내 쓰나요?
> req.user에 저장되며, 헤더 정보에서 가져와서 사용함.

🔶 **피드백**: `req.user`에 저장된다는 것은 정확합니다! 다만 "헤더 정보에서 가져온다"는 표현이 약간 불명확합니다. 꺼내는 방법 측면에서 `@GetUser()` 데코레이터를 직접 만들어 썼다는 점을 기억해 주세요.
📖 **정답**: `validate()`가 반환한 객체는 Passport 미들웨어가 자동으로 `req.user`에 주입합니다. 컨트롤러에서 꺼내 쓰는 방법은 두 가지입니다: ① `@Req() req: Request`로 전체 요청 객체를 받아 `req.user.id`로 접근하거나, ② 우리가 직접 만든 `@GetUser('id')` 커스텀 데코레이터를 사용하는 방법이 있습니다. 커스텀 데코레이터를 쓰면 코드가 훨씬 간결해집니다.

---

6. **Security Logic**: 북마크 수정/삭제 시 단순히 `id`만 체크하지 않고 `userId`를 함께 `where` 절에 넣는 이유는 무엇인가요?
> 해당 사용자가 등록한 북마크만 수정/삭제하기 위함.

✅ **피드백**: 정확합니다! 이것이 바로 '소유권 검증(Ownership Validation)'입니다.
📖 **정답**: `id`만으로 조회할 경우, 로그인한 사용자 B가 사용자 A의 북마크 ID를 알고 있다면 A의 북마크를 수정/삭제할 수 있는 치명적인 보안 취약점(IDOR: Insecure Direct Object Reference)이 생깁니다. `where: { id, userId }`처럼 소유자 ID를 함께 조건으로 걸면, 일치하는 행이 없어 자동으로 작업에 실패하게 됩니다.

---

7. **Bcrypt**: 비밀번호를 DB에 직접 저장하지 않고 '해시'화 하는 이유는 무엇이며, Bcrypt가 제공하는 `salt`의 개념은 왜 중요한가요?
> DB 정보가 유출되더라도 해커가 비밀번호를 알 수 없고, salt 개념을 사용하면 같은 평문이라도 암호화하면 늘 다른 값을 출력하기 때문에 보안성이 향상됨.

✅ **피드백**: 완벽한 정답입니다! `salt`의 핵심 역할인 '레인보우 테이블 공격 방어'까지 이해하고 있는 훌륭한 답변입니다.
📖 **정답**: 해시 함수는 단방향(복호화 불가)이므로 DB가 유출되어도 원본 비밀번호를 알 수 없습니다. `salt`는 해싱 전 비밀번호에 무작위 문자열을 추가하는 것으로, 덕분에 같은 비밀번호`"1234"`라도 다른 해시값이 생성됩니다. 이는 미리 계산된 해시 쌍 목록(레인보우 테이블)을 이용한 역추적 공격을 무력화합니다.

---

8. **Refresh Token Storage**: Refresh Token을 DB에 저장할 때 평문이 아닌 해시화(`hashedRt`)하여 저장해야 하는 보안상 이유는 무엇인가요?
> Refresh Token이 유출되면 access_token을 재발급 받을 수도 있기 때문에 암호화하여 저장함.

🔶 **피드백**: 유출 위험성을 인지하고 있다는 점은 좋습니다! 다만 "암호화"가 아닌 "해시화"라는 점을 구분하는 것이 중요합니다. 그리고 DB 자체가 뚫렸을 때의 상황을 더 구체적으로 생각해 보세요.
📖 **정답**: DB 자체가 침해당했을 때를 대비합니다. 만약 Refresh Token을 평문으로 저장했다면, 공격자는 DB를 열어 토큰을 그대로 복사해 `/auth/refresh`를 호출하여 어떤 계정이든 탈취할 수 있습니다. 해시화하여 저장하면 DB에 있는 값은 검증에만 사용할 수 있는 해시이므로 공격자가 원본 토큰 값을 얻을 수 없어 재사용이 불가능합니다.

---

9. **Guards**: `@UseGuards(JwtAuthGuard)`를 컨트롤러 클래스 레벨과 메서드 레벨에 각각 적용했을 때의 차이점은 무엇인가요?
> 클래스 레벨로 사용하면 클래스 내 모든 함수가 실행될 때, 가드가 실행됨.
> 메서드 레벨로 사용하면 해당 메서드가 실행될 때만, 가드가 실행됨.

✅ **피드백**: 정확하게 이해하고 있습니다!
📖 **정답**: 클래스 레벨(`@Controller` 위)에 설정하면 해당 컨트롤러의 모든 라우트 핸들러에 가드가 일괄 적용됩니다. 메서드 레벨에 설정하면 해당 라우트에만 적용되어 나머지는 보호받지 않습니다. 실무에서는 클래스 레벨로 전체 보호하고, `public`으로 열어둘 라우트에만 `@Public()` 같은 커스텀 메타데이터를 부착하는 패턴을 많이 사용합니다.

---

#### [Logic & Utils]
10. **Custom Decorator**: `@GetUser('id')`와 같이 커스텀 데코레이터를 만들었을 때, `ExecutionContext`에서 `switchToHttp()`를 호출해야 하는 이유는 무엇인가요?
> 어떤 방식으로 통신을 해도 오류없이 request에 접근이 가능함.

🔶 **피드백**: 방향성은 맞습니다! 조금 더 구체적으로 설명할 수 있어야 합니다.
📖 **정답**: `ExecutionContext`는 NestJS에서 현재 실행 컨텍스트를 나타내며, HTTP, WebSocket(ws), RPC(gRPC) 등 다양한 통신 프로토콜을 추상화합니다. `switchToHttp()`를 호출해야만 비로소 "현재 컨텍스트는 HTTP 기반이다"라고 명시적으로 좁혀주고, 여기서 `.getRequest()`를 통해 익숙한 HTTP `Request` 객체를 안전하게 꺼낼 수 있습니다. 이 과정 없이 `request` 객체에 직접 접근하면 다른 프로토콜 환경에서 오류가 발생합니다.

---

11. **Pipe & Validation**: `ValidationPipe` 설정 시 `whitelist: true` 옵션이 DTO에서 허용하지 않은 필드 전달을 어떻게 막아주나요?
> 모르겠다.

📖 **정답**: `whitelist: true`를 설정하면 ValidationPipe이 요청 바디를 수신했을 때, DTO 클래스에 데코레이터(`@IsString()` 등)로 선언된 속성만 남기고 **선언되지 않은 나머지 속성을 자동으로 제거(strip)**합니다. 예를 들어 클라이언트가 `{ title: "test", isAdmin: true }`를 보내도, DTO에 `isAdmin`이 없으면 서비스 레이어에는 `{ title: "test" }`만 전달됩니다. 한 단계 더 나아가 `forbidNonWhitelisted: true`를 추가하면 제거하는 대신 400 에러를 즉시 반환합니다.

---

## 📅 2026-03-17: Relationships & Documentation (Phase 3)
### ✅ 주요 학습 내용
- 다대다(N:M) 관계 구현 (Join Table: BookmarkTag)
- Prisma Transaction 및 Nested Writes (중첩 쓰기) 활용
- 복합 쿼리 필터링 (Search, Tag Filter, Favorite Filter)
- Swagger(OpenAPI)를 이용한 자동 API 문서화
- E2E 테스트 자동화 (Jest & Supertest)

### ❓ Self-Check Questions (Deep Dive)

#### [N:M Relationships]
1. **Model Design**: Prisma에서 암시적(Implicit) M:N 대신 명시적 연결 테이블(`BookmarkTag`)을 사용했을 때 데이터 제어 측면(예: 생성 시간 추가 등)에서 얻는 이점은 무엇인가요?
> 모르겠다

📖 **정답**: 암시적(Implicit) M:N은 Prisma가 내부적으로 연결 테이블을 자동 생성하지만, 그 테이블에 **커스텀 필드를 추가할 수 없습니다**. 명시적 연결 테이블(`BookmarkTag`)을 직접 정의하면 `createdAt`처럼 태그가 언제 북마크에 붙었는지 기록하거나, `order`(순서) 같은 추가 메타데이터를 자유롭게 넣을 수 있습니다. 또한 직접 `prisma.bookmarkTag.findMany()`처럼 조인 테이블 자체를 독립적으로 쿼리하고 제어할 수 있다는 것도 큰 장점입니다.

---

2. **Cardinality**: `BookmarkTag` 모델에서 `@@id([bookmarkId, tagId])` 복합 키 설정을 하는 목적은 무엇인가요?
> 단일 키로는 유일값을 만들 수 없기 때문.

✅ **피드백**: 핵심을 잘 이해하고 있습니다!
📖 **정답**: `bookmarkId`나 `tagId` 중 어느 하나만으로는 행을 고유하게 식별할 수 없습니다 (하나의 북마크는 여러 태그를 가질 수 있으므로). `@@id([bookmarkId, tagId])`는 두 컬럼의 조합이 항상 유일해야 함을 보장하는 복합 기본키(Composite Primary Key)입니다. 이를 통해 "이미 연결된 (북마크A, 태그1) 쌍이 중복으로 삽입되는 것"을 DB 수준에서 원천 차단합니다.

---

#### [Prisma Query & Logic]
3. **Nested Writes**: 북마크 생성 시 `tags: { create: ... }`와 같이 중첩 구조를 사용하면 코드의 원자성(Atomicity) 측면에서 어떤 장점이 있나요?
> 새로 생성된 bookmarkId에 들어가기 때문에, 값이 유일함.

🔶 **피드백**: 외래키가 자동으로 연결된다는 점은 맞습니다만, 질문의 핵심인 "원자성"에 대한 설명이 비어있습니다.
📖 **정답**: 중첩 쓰기의 가장 중요한 장점은 **원자성(All-or-Nothing)**입니다. `bookmark.create()`와 `bookmarkTag.createMany()`를 각각 두 번의 쿼리로 실행하면, `bookmark`는 생성되었는데 `bookmarkTag` 생성 도중 에러가 나면 태그 없는 북마크가 DB에 덩그러니 남게 됩니다. 중첩 쓰기는 Prisma가 이 과정 전체를 하나의 트랜잭션으로 묶어 처리하므로, 어느 한 단계라도 실패하면 전부 롤백(Rollback)되어 데이터 불일치가 발생하지 않습니다.

---

4. **Transaction**: `this.prisma.$transaction`을 사용하여 기존 태그 연결을 지우고(`deleteMany`) 새로 생성(`createMany`)할 때, 트랜잭션 처리를 하지 않으면 어떤 문제가 발생할 수 있나요?
> 생성하는 과정에서 오류가 발생하면, 지워진 데이터가 되돌려지지 않음

✅ **피드백**: 완벽한 핵심을 짚었습니다!
📖 **정답**: 트랜잭션 없이 순차 실행 시, `deleteMany`가 성공하고 `createMany`가 실패하면 기존 태그 연결은 사라지고 새 연결도 만들어지지 않아 북마크가 **태그가 전혀 없는 상태**로 오염됩니다. 이를 "Partial Update(부분 업데이트)" 문제라고 합니다. 트랜잭션을 사용하면 두 작업이 하나의 단위로 묶여 성공 혹은 실패가 함께 결정되므로 데이터 무결성이 보장됩니다.

---

5. **Include vs Select**: Prisma 쿼리에서 `include`를 사용하여 연관 데이터를 가져올 때와 `select`를 사용할 때의 차이점 및 성능상 고려사항은 무엇인가요?
> 모르겠다

📖 **정답**:
- **`include`**: 모델의 기본 필드를 모두 가져온 뒤, 추가로 관계된 데이터도 함께 가져옵니다. `include: { tags: true }`처럼 관계 이름을 키로 지정합니다. 간편하지만 불필요한 컬럼(예: `passwordHash`)까지 모두 가져오는 단점이 있습니다.
- **`select`**: 가져올 필드를 직접 지정하여 필요한 데이터만 선택적으로 가져옵니다. `select: { id: true, title: true }`처럼 사용하며, 관계 데이터도 `select` 내부에서 다시 `select`하여 세밀하게 제어할 수 있습니다. **성능 최적화**가 필요한 경우나 클라이언트에 노출하면 안 되는 필드(비밀번호 등)를 자동으로 제거하고 싶을 때 `select`가 유리합니다.

---

#### [Filtering & Search]
6. **Query Operators**: 특정 태그가 달린 북마크를 찾을 때 Prisma의 `some` 연산자가 필요한 이유와, 반대로 `every`, `none`은 어떤 경우에 사용될까요?
> 특정 태그가 하나라도 있는 경우를 찾기 위함.
> every를 사용하면 모든 태그가 특정 태그들로만 이루어진 북마크만 반환됨
> none은 그 태그가 없는 북마크를 반환함.

✅ **피드백**: 세 연산자 모두 정확하게 이해하고 있습니다. 훌륭합니다!
📖 **정답**: 관계형 필터에서 `some(하나라도)`, `every(모두)`, `none(하나도 없음)`은 배열 형태의 관계 데이터를 필터링하는 핵심 연산자입니다. `some`은 "NestJS 또는 React 태그 중 하나라도 있는 북마크", `every`는 "달린 태그가 모두 'Study' 태그인 북마크", `none`은 "'광고' 태그가 하나도 없는 북마크"를 찾을 때 사용합니다.

---

7. **Full-text Search**: 제목 검색에서 `mode: 'insensitive'` 옵션을 넣지 않았을 때 검색 결과가 어떻게 달라지며, 대소문자 구분이 DB 엔진마다 어떻게 다른가요?
> mode: insensitive를 사용하면 대소문자를 무시하여 조회가 가능함. 그래서 사용하지 않으면 같은 단어라도 대소문자가 다르면 조회되지 않음
> DB 엔진마다 어떻게 다른지는 모름

🔶 **피드백**: `mode: 'insensitive'`의 역할은 완벽하게 설명했습니다. DB 엔진 차이 부분만 보충합니다.
📖 **정답**: `mode: 'insensitive'`를 생략하면 기본값은 `mode: 'default'`로, DB 엔진의 기본 설정을 따릅니다. DB 엔진별 차이를 알아두면 좋습니다:
- **PostgreSQL**: 기본적으로 **대소문자 구분**을 합니다. `"Nest"`와 `"nest"`는 다른 값으로 처리됩니다.
- **MySQL**: Collation 설정에 따라 다르지만, 일반적으로 사용하는 `utf8_general_ci`(ci = case-insensitive)는 대소문자 **구분하지 않습니다**.
- 따라서 `mode: 'insensitive'`를 명시적으로 사용하면 DB가 바뀌어도 일관된 동작을 보장할 수 있습니다.

---

8. **Default Condition**: 필터링 로직 구현 시 `where` 객체에 `userId`를 가장 먼저 기본값으로 고정해야 하는 보안상 이유는 무엇인가요?
> 로그인한 사용자가 등록한 값만 보기 위함.

✅ **피드백**: 정확합니다!
📖 **정답**: 태그/검색어 등 필터 파라미터는 클라이언트(사용자)가 임의로 조작할 수 있습니다. 만약 `userId` 조건 없이 `?tag=NestJS` 같은 필터만 적용하면, 다른 사용자의 NestJS 태그 북마크까지 모두 노출되는 정보 유출 사고가 발생합니다. `where`의 첫 번째 조건으로 `userId: 로그인한_유저_ID`를 항상 고정하면, 이후 어떤 복잡한 필터가 덧붙더라도 자신의 데이터 범위 내에서만 검색이 이뤄져 보안이 보장됩니다.

---

#### [Documentation & Testing]
9. **Swagger (OpenAPI)**:
   - Swagger에서 JWT 인증 테스트를 가능하게 하려면 `main.ts`의 `DocumentBuilder`에 어떤 설정을 추가해야 하나요?
   > 모르겠다

   📖 **정답**: `DocumentBuilder`에 `.addBearerAuth()`를 호출하면 Swagger UI에 `Authorize` 버튼이 생깁니다. 이 버튼으로 JWT 토큰을 입력하면 이후 모든 API 호출 시 `Authorization: Bearer <token>` 헤더가 자동으로 포함됩니다. 그리고 보호된 컨트롤러나 메서드에는 `@ApiBearerAuth('access-token')` 데코레이터를 추가하여 해당 API가 인증이 필요하다고 Swagger UI에 표시합니다.

   - `PartialType`을 사용할 때 `@nestjs/mapped-types` 대신 `@nestjs/swagger`에서 가져와야 하는 결정적인 이유는 무엇인가요?
   > 모르겠다

   📖 **정답**: `@nestjs/mapped-types`의 `PartialType`은 런타임 검증(class-validator)은 잘 처리하지만, **`@ApiProperty` 메타데이터를 상속하지 못합니다**. 따라서 `UpdateBookmarkDto`를 Swagger 문서로 보면 아무 필드도 나오지 않습니다. `@nestjs/swagger`의 `PartialType`을 사용하면 부모 DTO의 `@ApiProperty` 정보까지 모두 올바르게 상속하여 Swagger 문서에 모든 필드가 정상적으로 표시됩니다.

---

10. **DTO Mapping**: `@ApiProperty` 데코레이터를 DTO에 추가했을 때 실제 데이터 흐름(`runtime`)과 문서 출력(`documentation`)에 각각 어떤 영향을 미치나요?
> 모르겠다

📖 **정답**:
- **런타임(Runtime)**: `@ApiProperty`는 런타임 동작에 **아무런 영향을 주지 않습니다**. 데이터 검증은 `@IsString()`, `@IsNotEmpty()` 등 `class-validator` 데코레이터가 담당하며, `@ApiProperty`는 실행 중에 아무 코드도 실행하지 않습니다.
- **문서화(Documentation)**: `@ApiProperty`의 `example`, `description`, `required` 정보가 Swagger UI에 표시됩니다. 덕분에 API를 사용하는 개발자가 어떤 값을 입력해야 하는지 한눈에 파악할 수 있습니다.

---

11. **E2E Testing**:
    - `supertest`를 이용한 테스트에서 `set('Authorization', 'Bearer ...')`와 같이 헤더를 직접 설정해야 하는 이유는 무엇인가요?
    > 모르겠다

    📖 **정답**: E2E 테스트에서는 실제 브라우저가 아닌 supertest가 HTTP 요청을 직접 만들어 보냅니다. 실제 서비스에서는 로그인 후 브라우저나 클라이언트 앱이 저장해 둔 토큰을 자동으로 헤더에 붙여주지만, 테스트 환경에서는 이 과정을 직접 코드로 흉내내야 합니다. `set('Authorization', 'Bearer ...')`가 바로 그 역할을 합니다. 헤더 없이 보호된 API를 호출하면 `JwtAuthGuard`가 토큰이 없다고 판단해 `401 Unauthorized`를 반환합니다.

    - 테스트 종료 후 `afterAll`에서 `prisma.$disconnect()`를 호출하지 않으면 어떤 사이드 이펙트가 발생할 수 있나요?
    > 메모리 누수를 막기위해

    🔶 **피드백**: 메모리 누수 방지라는 방향성은 맞습니다. 조금 더 정확하게 보충합니다.
    📖 **정답**: `prisma.$disconnect()`를 호출하지 않으면 Prisma가 DB와의 연결 풀(Connection Pool)을 열어둔 채로 테스트가 종료됩니다. 이 경우 Jest가 "1개 이상의 비동기 작업이 아직 종료되지 않았다"는 경고(`--detectOpenHandles`)를 띄우며 프로세스가 정상 종료되지 않고 강제로 타임아웃될 수 있습니다. 명시적으로 연결을 닫아야 Jest가 깔끔하게 종료됩니다.

    - 테스트 시마다 유니크한 이메일(`Date.now()`)을 사용하여 사용자 계정을 생성해야 하는 이유는 무엇인가요?
    > 사용자 계정이 동일하면 안되기 때문에

    🔶 **피드백**: 맞습니다! 좀 더 구체적인 이유를 알면 더 좋습니다.
    📖 **정답**: User 테이블의 `email` 컬럼에는 `@unique` 제약이 걸려 있습니다. `test@test.com` 같은 고정 이메일을 사용하면, 첫 번째 테스트 실행 후 DB에 해당 계정이 남고, 두 번째 실행 시 `P2002 Unique constraint failed` 에러가 발생하여 테스트가 실패합니다. `Date.now()` 타임스탬프를 붙이면 매 실행마다 새로운 유니크 이메일이 생성되어 DB를 초기화하지 않아도 항상 테스트를 독립적으로 실행할 수 있습니다.

---

## 💡 학습 꿀팁
- **Prisma Studio**: 데이터가 의도한 대로 조인 테이블에 잘 들어가는지 확인하고 싶을 땐 `npx prisma studio`가 가장 빠른 확인 방법입니다.
- **REST Client**: Swagger UI 외에도 VS Code의 `REST Client` 확장이나 Postman을 병행하여 API 응답 헤더(Cookie, Header)를 심층 분석해 보세요.
- **Error Logs**: `500 Internal Server Error` 발생 시 터미널의 NestJS 로그에서 Prisma의 에러 코드(예: `P2002`)를 확인하는 습관을 들입시다.