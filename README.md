# Haecho Portfolio

순수 HTML, CSS, JavaScript로 만든 반응형 개인 포트폴리오입니다. 프레임워크 없이 사용자 이벤트가 상태를 변경하고, 변경된 상태가 다시 화면에 반영되는 흐름을 직접 구현했습니다.

- 배포: https://cweedlee.github.io/codyssey-B1-1/
- 저장소: https://github.com/cweedlee/codyssey-B1-1
- 과제 원문: [`assignment.pdf`](assignment.pdf)
- 요구사항별 진행 상태: [`PROGRESS.md`](PROGRESS.md)
- 평가 예상 질문: [`EVALUATION_QA.md`](EVALUATION_QA.md)

## 과제 목표

최신 Chrome을 기준으로 동작하는 반응형 포트폴리오를 외부 UI 프레임워크 없이 제작하는 과제입니다. 다음 항목을 핵심 평가 대상으로 구현했습니다.

- 시맨틱 HTML 기반 Hero, About, Skills, Projects, Contact, Footer
- 모바일 우선 반응형 레이아웃과 햄버거 메뉴
- 다크모드 및 사용자 설정 유지
- GitHub REST API를 이용한 실제 저장소 목록
- API 로딩·성공·오류·빈 상태 처리
- Contact 폼 유효성 검사
- 스크롤 이동, 헤더 변화, 탑 버튼, 노출 애니메이션
- 명확한 사용자 이벤트 → 상태 변경 → 화면 렌더링 흐름

## 핵심 구현

### 중앙 상태 관리

`js/main.js`의 단일 `state` 객체가 테마, GitHub 저장소, API 상태, 활성 언어, 폼 오류와 성공 상태를 관리합니다. 모든 상태 변경은 `setState()`를 통과하며, `renderStateChanges()`가 이전 상태와 비교해 필요한 영역만 갱신합니다.

```text
사용자 이벤트 또는 API 응답
        ↓
setState(updates)
        ↓
renderStateChanges(previousState)
        ↓
테마 / Projects / Contact UI 갱신
```

이 흐름은 다음 네 가지 기능에 공통으로 적용됩니다.

- 다크모드 버튼 → `theme` 변경 → 전체 테마 렌더링 및 `localStorage` 저장
- GitHub API 요청 → `projectStatus` 변경 → 요청 상태별 Projects 렌더링
- 폼 submit/input → `formErrors` 변경 → 필드별 오류 렌더링
- 언어 필터 클릭 → `activeLanguage` 변경 → 프로젝트 카드 목록 렌더링

### 실제 GitHub API 연결

`fetchRepositories()`가 다음 엔드포인트를 `fetch`와 `async/await`로 호출합니다.

```text
https://api.github.com/users/cweedlee/repos?sort=updated&per_page=100
```

fork 저장소를 제외하고 최근 갱신순 최대 9개를 표시합니다. 저장소명, 설명, 언어, 별 개수, 링크는 `escapeHtml()`을 거쳐 카드 HTML에 삽입됩니다.

| 상태 | 화면 |
|---|---|
| `loading` | 스피너와 “로딩 중...” |
| `success` | 저장소 카드와 언어 필터 |
| `empty` | “표시할 프로젝트가 없습니다.” |
| `error` | 오류 메시지와 재시도 버튼 |

403을 포함한 비정상 HTTP 응답과 네트워크 예외는 모두 오류 상태로 전환됩니다. 403 요청 한도와 네트워크 오류는 원인을 구분해 안내하며, JavaScript 파일에는 버전 쿼리를 적용해 배포 후 이전 파일이 브라우저 캐시에 남지 않도록 했습니다.

### 폼 유효성 검사

이름, 이메일, 메시지는 모두 필수입니다. 이메일은 정규식으로 형식을 검사하며, 오류 문구는 각 입력 필드 가까이에 표시됩니다. 오류가 발생한 필드를 다시 입력하면 `input` 이벤트에서 상태를 재검증하고 해당 오류를 갱신합니다.

### 반응형 UI와 접근성

- 모바일 우선 CSS와 `768px`, `1024px` 브레이크포인트
- Flexbox 네비게이션과 Grid 프로젝트 카드
- 모든 이미지의 의미 있는 `alt`
- `label[for]`와 입력 `id` 연결
- 메뉴 버튼의 `aria-expanded`, 폼의 `aria-invalid`, 상태 영역의 `role="status"`
- 키보드 포커스를 고려한 링크·입력 스타일

## 사용 기술

- HTML5 시맨틱 마크업
- CSS Variables, Flexbox, Grid, Media Query, Transition
- Vanilla JavaScript ES6+
- Fetch API, async/await
- Web Storage API
- Intersection Observer API
- GitHub REST API

외부 UI 프레임워크와 JavaScript 라이브러리는 사용하지 않았습니다.

## 프로젝트 구조

```text
.
├── index.html
├── css/
│   └── style.css
├── js/
│   └── main.js
├── images/
│   └── profile.svg
├── assignment.pdf
├── README.md
├── PROGRESS.md
└── EVALUATION_QA.md
```

## 실행 방법

별도 빌드나 패키지 설치가 필요하지 않습니다.

```bash
python3 -m http.server 4173 --bind 127.0.0.1
```

브라우저에서 http://127.0.0.1:4173 에 접속합니다. VS Code Live Server로 `index.html`을 열어도 됩니다.

## 평가 시연 순서

1. 데스크톱과 모바일 너비에서 레이아웃 및 햄버거 메뉴를 확인합니다.
2. 다크모드를 켠 뒤 새로고침해 설정 유지 여부를 확인합니다.
3. Projects에서 GitHub 저장소 카드와 언어 필터를 확인합니다.
4. 네트워크를 차단하거나 GitHub 요청을 403으로 만들어 오류·재시도 UI를 확인합니다.
5. Contact 폼을 빈 상태와 잘못된 이메일로 제출해 필드별 오류를 확인합니다.
6. 페이지를 스크롤해 헤더, 탑 버튼, 섹션 노출 애니메이션을 확인합니다.

## 검증 명령

```bash
# JavaScript 문법
node --check js/main.js

# 금지된 var, 인라인 이벤트, 인라인 스타일
rg -n '\bvar\b|on(click|submit|input|scroll)\s*=|style=' index.html js/main.js

# state 속성 직접 대입 여부
rg -n --pcre2 '\bstate\.[A-Za-z_$][A-Za-z0-9_$]*\s*=(?!=)' js/main.js

# 실제 GitHub API
curl -sS 'https://api.github.com/users/cweedlee/repos?sort=updated&per_page=100'
```

상세 검증 이력과 남은 제출 작업은 [`PROGRESS.md`](PROGRESS.md)에서 확인할 수 있습니다.

## 알려진 제한

- 인증 없는 GitHub API는 시간당 60회 요청 제한이 있습니다. 제한 시 오류 상태와 재시도 버튼을 표시합니다.
- Contact 폼은 클라이언트 유효성 검사와 성공 UI까지만 구현했으며 실제 메일을 발송하지 않습니다.
- 제출용 데스크톱·모바일·다크모드 스크린샷은 아직 추가되지 않았습니다.
