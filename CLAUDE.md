# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 목적

React 19 + TypeScript + Vite 기반 노트 앱 **실습 프로젝트**. 강의 예제용으로, 기능을 점진적으로 추가하는 방식으로 진행 중 (예: `Note` 타입에 `tags` 필드 미구현 — 강의 진행에 따라 추가 예정).

## 개발 환경

```bash
npm run dev       # Vite(5173) + JSON Server(3001) 동시 실행 — 항상 이걸 사용
npm run server    # JSON Server만 별도 실행
npm test          # Vitest 단일 실행
npm run test:watch
npm run lint      # ESLint --fix 포함
npm run format    # Prettier
```

- 앱: http://localhost:5173
- API: http://localhost:3001/notes
- DB 파일: `db.json` (JSON Server가 watch)

`npm run dev` 없이 앱을 테스트하면 API 호출이 전부 실패함.

## 아키텍처

```
src/
├── api/notes.ts          # fetch 래퍼 (CRUD 4개 함수)
├── context/NotesContext.tsx  # 전역 상태 — useNotes() 훅 노출
├── components/           # UI 컴포넌트 (Layout, NoteList, NoteItem, NoteEditor)
├── types/note.ts         # Note 인터페이스
└── main.tsx              # 진입점
```

**데이터 흐름**: `api/notes.ts` → `NotesContext` → 컴포넌트

- 상태 관리: React Context + useState (외부 상태 라이브러리 없음)
- 스타일: Tailwind CSS v4 (`@tailwindcss/vite` 플러그인, CSS 파일 import 방식)
- 테스트: Vitest + Testing Library + jsdom (`vite.config.ts`에 test 설정 포함)

## 구현 패턴

**API 레이어** (`src/api/notes.ts`): 순수 fetch 함수만 export. 상태 없음.

**Context** (`NotesContext.tsx`): API 호출 후 로컬 state를 optimistic하지 않고 서버 응답으로 직접 업데이트.

**컴포넌트**: 선택 상태(`selectedNoteId`, `isCreating`)는 `App.tsx`가 소유, `NoteEditor`에 props로 전달.

## 코드 스타일

Prettier 설정 (`.prettierrc`):
- `singleQuote: true`, `semi: true`, `tabWidth: 2`, `trailingComma: "all"`, `printWidth: 100`

TypeScript: `interface` 사용 (type alias 혼용 있으나 interface 우선).

## 테스트

```bash
npm test                    # 전체 실행
npx vitest run src/foo.test.tsx  # 단일 파일
```

테스트 setup: `src/test-setup.ts` → `@testing-library/jest-dom` import.
