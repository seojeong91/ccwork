---
name: mermaid-diagram
description: |
  프로젝트의 src/ 디렉토리를 분석해 컴포넌트 의존성 그래프와 상태 흐름을 Mermaid 다이어그램으로 시각화하고,
  docs/architecture/index.html 파일로 저장한 뒤 브라우저를 여는 스킬.
  "구조 시각화", "아키텍처 다이어그램", "의존성 그래프", "컴포넌트 관계", "Mermaid", "흐름도",
  "어떻게 연결되어 있어?", "파일 구조 보여줘" 같은 요청에 반드시 이 스킬을 사용한다.
---

## 목적

`src/` 아래 TypeScript/TSX 파일들의 import 관계를 추출해 두 개의 Mermaid 다이어그램으로 시각화한다.

1. **컴포넌트 의존성 다이어그램** — 파일 간 import 연결을 레이어별로 표현
2. **상태 흐름 다이어그램** — 데이터가 API → Context → 컴포넌트로 흐르는 경로 표현

## 실행 단계

### 1단계 — 소스 분석

`Glob("src/**/*.{ts,tsx}")` 로 전체 파일 목록을 수집한다.  
각 파일을 Read 해서 다음을 추출한다:

- **레이어 분류**: `types/` → `api/` → `context/` → `components/` → 루트(`App.tsx`, `main.tsx`) 순서
- **import 관계**: `import ... from '...'` 구문에서 상대 경로(`./`, `../`)를 파싱해 파일 간 엣지 생성
- **Context 노출 값/함수**: Context 파일에서 `useState`, 노출 함수명, `useXxx()` 훅 이름 추출
- **컴포넌트 props**: 각 컴포넌트가 받는 주요 props와 호출하는 Context 함수 목록

### 2단계 — Mermaid 다이어그램 생성

#### 다이어그램 1: 컴포넌트 의존성 (`flowchart TD`)

레이어를 `subgraph`로 묶어 계층을 명확히 한다.

```
flowchart TD
  subgraph TYPES["📦 Types"]
    Note["note.ts\nNote interface"]
  end
  subgraph API["🌐 API Layer"]
    NotesAPI["api/notes.ts\nfetchNotes / createNote\nupdateNote / deleteNote"]
  end
  subgraph CONTEXT["🧠 Context"]
    NotesCtx["NotesContext.tsx\nNotesProvider / useNotes()"]
  end
  subgraph COMPONENTS["🧩 Components"]
    Layout NoteList NoteItem NoteEditor
  end
  subgraph ROOT["🚀 Entry"]
    App main
  end
  Note --> NotesAPI
  Note --> NotesCtx
  NotesAPI --> NotesCtx
  NotesCtx --> NoteList
  NotesCtx --> NoteEditor
  NoteList --> NoteItem
  App --> NotesCtx
  App --> Layout
  App --> NoteList
  App --> NoteEditor
  main --> App
```

실제 파일에서 추출한 관계로 엣지를 채운다. 노드 레이블에는 파일명과 주요 export를 간략히 표시한다.

#### 다이어그램 2: 상태 흐름 (`flowchart LR`)

사용자 액션 → API 호출 → 상태 업데이트 → UI 반영 흐름을 왼쪽→오른쪽으로 표현한다.

```
flowchart LR
  DB[("🗄️ db.json\nJSON Server :3001")]
  API["api/notes.ts"]
  CTX["NotesContext\nnotes[] / loading / error\ncreateNote / updateNote / deleteNote"]
  APP["App.tsx\nselectedNoteId\nisCreating"]
  LIST["NoteList\nonSelect / onDelete"]
  EDITOR["NoteEditor\nonDone"]

  DB <-->|fetch/REST| API
  API -->|setNotes| CTX
  CTX -->|useNotes()| LIST
  CTX -->|useNotes()| EDITOR
  APP -->|props| LIST
  APP -->|props| EDITOR
  LIST -->|onSelect| APP
  EDITOR -->|onDone| APP
```

Context가 노출하는 값·함수를 노드 레이블에 명시한다. 알려진 버그/미구현 사항이 있다면 노드에 주석(`:::warning` 스타일 또는 설명 텍스트)으로 표시한다.

### 3단계 — HTML 파일 생성

`docs/architecture/` 디렉토리를 생성하고 `docs/architecture/index.html`을 작성한다.

HTML 구조:
- `<head>`: Mermaid CDN (`https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js`), 기본 CSS
- 상단 헤더: 프로젝트명, 생성 날짜
- **섹션 1**: 컴포넌트 의존성 다이어그램 + 설명
- **섹션 2**: 상태 흐름 다이어그램 + 설명
- **섹션 3**: 알려진 이슈/미구현 사항 목록 (CLAUDE.md의 "알려진 불일치 패턴"에서 추출)
- 각 `<pre class="mermaid">` 블록에 다이어그램 코드 삽입

CSS 기준:
- 배경: `#0f1117` (다크), 텍스트: `#e2e8f0`
- 섹션 카드: `#1a1d2e`, 테두리 `#2d3748`
- 최대 너비 `1100px`, 가운데 정렬

`mermaid.initialize({ startOnLoad: true, theme: 'dark' })` 설정.

### 4단계 — 브라우저 실행

OS에 맞는 명령어로 파일을 연다:

| OS | 명령어 |
|----|--------|
| Windows | `start docs/architecture/index.html` |
| macOS | `open docs/architecture/index.html` |
| Linux | `xdg-open docs/architecture/index.html` |

현재 환경의 `Platform` 정보(`win32` / `darwin` / `linux`)를 확인해 명령어를 선택한다.

## 출력 파일

- `docs/architecture/index.html` (단일 파일, 외부 의존 없음 — CDN만 사용)

## 주의사항

- 파일을 분석할 때 추론하지 말고 실제 import 구문 기반으로 엣지를 결정한다.
- 노드 레이블은 파일명(확장자 제외) + 핵심 export 1~3개로 간결하게 유지한다.
- Mermaid 문법 오류를 방지하기 위해 노드 ID에는 영문자/숫자/언더스코어만 사용한다 (한글 제외).
- 생성 완료 후 HTML 파일 경로와 브라우저 실행 결과를 사용자에게 알린다.
