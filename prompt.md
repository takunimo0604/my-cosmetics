# 화장품 브랜드 랜딩 페이지 기능 및 CRUD 통합 연동 요청

현재 Next.js App Router와 Tailwind CSS 기반의 화장품 랜딩 페이지(`app/page.tsx`)에 Supabase를 연동하여 **회원 인증 기능**과 **게시판 CRUD(생성/조회/수정/삭제) 기능**을 모두 완성해줘.

---

### [1. Supabase 연동 및 회원 인증 (Authentication)]
- `@supabase/supabase-js` 패키지를 사용하여 Supabase 클라이언트를 연동해줘.
- **로그인 모달 UI & 탭 구현:**
  1. **로그인:** 이메일/비밀번호 입력 후 `signInWithPassword` 로그인 처리
  2. **회원가입:** 이메일/비밀번호 입력 후 `signUp` 가입 처리
  3. **비밀번호 재설정:** 이메일 입력 후 `resetPasswordForEmail` 재설정 이메일 발송
- **헤더 상태 반영:** 로그인 성공 시 '로그인' 버튼을 '로그아웃' 및 '내 정보'로 변경하고, `signOut` 기능 제공

---

### [2. Q&A / 리뷰 게시판 CRUD 기능 구현]
Supabase의 `qna` (또는 `reviews`) 테이블과 연동하여 사용자가 글을 작성, 조회, 수정, 삭제할 수 있는 섹션을 메인 페이지 하단에 만들어줘.

1. **생성 (Create - 글 작성):**
   - 작성자 이름(또는 이메일), 제목, 내용을 입력받아 Supabase DB에 저장
2. **조회 (Read - 글 목록 및 상세):**
   - 저장된 게시글 목록을 리스트 형태로 불러와서 화면에 카드/테이블 형태로 표시
3. **수정 (Update - 글 수정):**
   - 각 게시글 카드에 [수정] 버튼 제공
   - 클릭 시 기존 작성 내용을 폼에 불러와 수정 후 Supabase DB 업데이트
4. **삭제 (Delete - 글 삭제):**
   - 각 게시글 카드에 [삭제] 버튼 제공
   - 클릭 시 확인 창 후 Supabase DB에서 해당 글 삭제 및 목록 새로고침

---

### [3. 예외 처리 및 안내]
- `.env.local`에 `NEXT_PUBLIC_SUPABASE_URL` 및 `NEXT_PUBLIC_SUPABASE_ANON_KEY` 환경 변수가 누락되었을 경우 친절한 안내 메시지 표시
- 작업 성공/실패 시 사용자에게 알림 메시지(toast 또는 alert) 표시
- 전체 디자인은 깔끔하고 감성적인 클린 뷰티 톤앤매너 유지

위 모든 기능을 포함하여 `app/page.tsx` 파일 코드를 직접 완성해줘.