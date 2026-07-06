# 문적만 블로그

Supabase(DB) + GitHub Pages(호스팅)로 만든 개인 블로그입니다.

- `blog.munjeokman.kro.kr` 접속 → 글 목록, 조회수, 댓글이 보이는 블로그
- `blog.munjeokman.kro.kr/?key=admin` 접속 → 비밀번호(0508) 입력 후 글쓰기/수정/삭제 가능한 관리자 페이지

아래 순서대로 진행하면 됩니다. **1) Supabase 설정 → 2) 코드에 키 입력 → 3) GitHub 업로드 → 4) 도메인 연결** 순서입니다.

---

## 1. Supabase 프로젝트 만들기

1. https://supabase.com 에서 회원가입 후 **New Project** 생성 (리전은 Northeast Asia(Seoul) 추천)
2. 프로젝트 생성이 끝나면 좌측 메뉴 **SQL Editor** 로 이동
3. 이 저장소의 `supabase/schema.sql` 내용을 전부 복사해서 붙여넣고 **Run** 실행
   - `posts`, `comments` 테이블과 조회수 증가 함수, 보안 정책(RLS)이 한 번에 생성됩니다.
4. 좌측 메뉴 **Authentication → Users** 로 이동 → **Add user** 클릭
   - Email: `admin@munjeokman.local` (원하면 바꿔도 되는데, 바꾸면 아래 `supabaseClient.js`의 `ADMIN_EMAIL`도 똑같이 바꿔야 함)
   - Password: `0508`
   - **Auto Confirm User** 체크 후 생성
   - 이게 곧 "관리자 로그인 비밀번호 0508"의 정체입니다. Supabase 정식 로그인 기능을 쓰기 때문에 비밀번호가 코드에 그대로 노출되지 않고 안전합니다.
5. 좌측 메뉴 **Project Settings → API** 로 이동 → **Project URL** 과 **anon public key** 복사해두기 (다음 단계에서 사용)

---

## 2. 코드에 Supabase 키 입력

`js/supabaseClient.js` 파일을 열어서 아래 두 줄을 방금 복사한 값으로 바꿔주세요.

```js
const SUPABASE_URL = "https://YOUR-PROJECT-REF.supabase.co";
const SUPABASE_ANON_KEY = "YOUR-ANON-PUBLIC-KEY";
```

(anon key는 공개되어도 되는 키입니다. 실제 쓰기 권한은 위에서 설정한 RLS 정책과 로그인 여부로 제어됩니다.)

---

## 3. GitHub에 업로드

1. GitHub에서 새 저장소 생성 (예: `munjeokman-blog`), Public 이든 Private 이든 상관없습니다 (Private이어도 GitHub Pages는 무료로 됩니다. 단, Private repo의 Pages는 Pro 계정 필요 — 안 되면 Public으로 만드세요)
2. 로컬에서:

```bash
cd blog
git init
git add .
git commit -m "init blog"
git branch -M main
git remote add origin https://github.com/사용자명/munjeokman-blog.git
git push -u origin main
```

3. GitHub 저장소 → **Settings → Pages**
   - Source: `Deploy from a branch`
   - Branch: `main` / `/(root)`
   - 저장

몇 분 뒤 `https://사용자명.github.io/munjeokman-blog/` 로 접속되는지 확인하세요.

---

## 4. 커스텀 도메인 연결 (blog.munjeokman.kro.kr)

이미 저장소에 `CNAME` 파일(`blog.munjeokman.kro.kr` 적혀있음)이 포함되어 있어서, GitHub 쪽 설정은 아래만 하면 됩니다.

1. 저장소 **Settings → Pages → Custom domain** 에 `blog.munjeokman.kro.kr` 입력 후 저장
2. **kro.kr DNS 관리 화면**(가입한 사이트, 보통 무료 DNS인 https://kro.kr 관리자 페이지)에서 아래 레코드 추가:

```
타입: CNAME
호스트: blog
값(대상): 사용자명.github.io
```

- 예: 사용자명이 `hong123` 이면 값은 `hong123.github.io`
- 반영까지 보통 몇 분 ~ 몇 시간 걸릴 수 있습니다.

3. DNS가 반영되면 GitHub Pages 설정 화면에서 자동으로 **HTTPS 인증서(Enforce HTTPS)** 를 발급해줍니다. 발급 후 "Enforce HTTPS" 체크박스를 켜두세요.

4. `https://blog.munjeokman.kro.kr` 접속해서 블로그가 뜨는지 확인 → `https://blog.munjeokman.kro.kr/?key=admin` 접속해서 비밀번호 `0508` 입력 → 글쓰기가 되는지 확인

---

## 사용법 요약

- **글쓰기/수정/삭제**: `?key=admin` 으로 들어가서 비밀번호 입력 후 진행. "공개" 체크를 풀면 임시저장(비공개) 상태로 저장됩니다.
- **조회수**: 글 하나를 열 때마다 자동으로 +1 (같은 브라우저 세션에서 새로고침해도 중복 카운트되지 않음)
- **댓글**: 이름 + 내용 입력 후 누구나 등록 가능. 삭제는 관리자 페이지에서 직접 Supabase 대시보드(Table Editor)로 지우거나, 필요하면 관리자 페이지에 댓글 삭제 버튼을 추가로 요청해도 됩니다.

## 이미지 · 수식(라텍스) 기능 추가하기 (기존에 만든 블로그 업데이트하는 경우)

이미 Supabase 프로젝트를 만들어서 쓰고 계셨다면, 아래 SQL만 추가로 한 번 더 실행하면 됩니다.

1. Supabase 대시보드 → **SQL Editor**
2. 이 저장소의 `supabase/schema.sql` 파일 맨 아래 `이미지 업로드용 Storage 버킷` 부분부터 끝까지 복사해서 붙여넣고 **Run**
   (전체 파일을 다시 실행해도 안전하게 무시되도록 되어 있으니, 처음부터 끝까지 다시 실행해도 괜찮습니다)
3. 그 다음 GitHub 저장소에 새로 바뀐 파일들(html/js/css)을 push 하면 끝입니다.

## 글쓰기 사용법 (마크다운 + 이미지 + 수식)

관리자 페이지 에디터에서:

- **이미지 삽입** 버튼 → 사진 선택 → 자동 업로드 후 커서 위치에 삽입됩니다. 여러 장 넣고 싶으면 원하는 위치에 커서 두고 버튼을 여러 번 누르면 됩니다.
- **수식 삽입** 버튼 → `$$  $$` 틀이 생기고 커서가 가운데 위치합니다. 그 안에 라텍스 문법을 쓰면 됩니다. 예: `$$x^2 + y^2 = r^2$$`
  - 문장 중간에 짧은 수식을 쓰고 싶으면 `$x^2$` 처럼 한 개의 `$`로 감싸면 됩니다.
- **작성 / 미리보기** 탭으로 전환하면서 실제로 어떻게 보일지 바로 확인할 수 있습니다.
- 일반 마크다운 문법도 지원합니다: `# 제목`, `**굵게**`, `*기울임*`, `- 목록`, `` `코드` ``, `> 인용` 등.

## 나중에 바꾸고 싶을 수 있는 것들

- 관리자 비밀번호 변경: Supabase 대시보드 → Authentication → Users → 해당 유저 → 비밀번호 재설정
- 디자인/색상: `css/style.css` 수정
- 마크다운 글쓰기 지원, 이미지 업로드(Supabase Storage), 댓글 스팸 방지(캡차) 등은 추가 개발이 필요하며 요청 시 이어서 작업 가능합니다.

fiAsY6UXj6YDb26Y