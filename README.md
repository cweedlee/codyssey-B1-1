# AI/SW 기초 과제 요구사항 정리

## 과제 개요

순수 `HTML`, `CSS`, `JavaScript`만 사용하여 반응형 개인 포트폴리오 웹사이트를 제작한다. 외부 프레임워크 없이 DOM 조작, 이벤트 처리, 비동기 API 호출, 상태 변경에 따른 화면 렌더링 흐름을 직접 구현하는 것이 핵심이다.

## 최종 결과물

- 반응형 포트폴리오 웹사이트 1개
- GitHub Pages로 배포된 사이트 URL
- GitHub 저장소 URL
- 데스크톱, 모바일, 다크모드 화면 스크린샷
- 프로젝트 설명과 사용 기술, 배포 URL, 스크린샷이 포함된 README

## 필수 섹션

- `Hero`: 인사말, CTA 버튼
- `About`: 자기소개, 프로필 이미지
- `Skills`: 기술 스택 목록
- `Projects`: GitHub API 연동 프로젝트 카드
- `Contact`: 문의 폼
- `Footer`: 저작권, 소셜 링크

## 프로젝트 구조

최소한 다음 역할이 분리되어야 한다.

```text
.
├── index.html
├── css/
│   └── style.css
├── js/
│   └── main.js
└── images/
```

- 외부 스타일시트와 JavaScript 파일을 HTML에 올바르게 연결한다.
- JavaScript 파일은 `defer` 속성으로 연결한다.
- VS Code와 Live Server로 실시간 개발 환경을 구성한다.

## HTML 요구사항

- 전체 레이아웃을 `div`만으로 구성하지 않고 시맨틱 태그를 사용한다.
- 사용 권장 태그: `header`, `nav`, `main`, `section`, `article`, `footer`
- 네비게이션에는 각 섹션으로 이동하는 앵커 링크가 있어야 한다.
- 모든 이미지에는 의미 있는 `alt` 속성이 있어야 한다.
- 폼 요소에는 `label`이 올바르게 연결되어야 한다. (`for`와 `id` 매칭)

## CSS 요구사항

- 외부 스타일시트 `css/style.css`를 사용한다.
- `:root`에 색상, 폰트, 간격 등 CSS 변수를 정의한다.
- 다크모드용 CSS 변수는 `[data-theme="dark"]`로 별도 정의한다.
- 네비게이션은 Flexbox로 구현한다. 로고는 왼쪽, 메뉴는 오른쪽에 배치한다.
- Projects 카드는 Grid로 구현한다. `auto-fit`, `minmax`를 활용한 반응형 구성이 권장된다.
- 모바일 퍼스트 방식으로 작성한다.
- 브레이크포인트는 `768px`, `1024px`를 사용한다.
- 모바일에서는 네비게이션이 숨겨지고 햄버거 버튼이 나타나야 한다.
- 버튼과 카드에는 `hover` 효과, `transition`, `box-shadow`를 적용한다.

## JavaScript 요구사항

- `var` 대신 `const`, `let`만 사용한다.
- HTML에 `onclick` 같은 인라인 이벤트 속성을 사용하지 않는다.
- 이벤트는 `addEventListener`로 연결한다.
- DOM 선택에는 `querySelector`, `querySelectorAll`을 사용한다.
- 내용 변경에는 `textContent`, `innerHTML`을 활용한다.
- 클래스 조작에는 `classList.add`, `classList.remove`, `classList.toggle`을 사용한다.
- `click`, `submit`, `scroll`, `input` 이벤트를 다룬다.
- 폼 제출 시 `event.preventDefault()`로 기본 동작을 방지한다.

## 필수 인터랙션

- 햄버거 메뉴 토글
  - 모바일에서 버튼 클릭 시 메뉴가 나타나고 다시 클릭하면 사라진다.
  - `classList.toggle('active')`를 활용한다.
- 부드러운 스크롤
  - 네비게이션 메뉴 클릭 시 해당 섹션으로 부드럽게 이동한다.
- 스크롤 탑 버튼
  - 스크롤 300px 이상에서 버튼이 나타난다.
  - 기준값을 변경할 경우 README에 명시한다.
  - 클릭 시 페이지 맨 위로 이동한다.
- 네비게이션 스타일 변경
  - 스크롤 60px 이상에서 네비게이션 배경색이 변경된다.
  - 기준값을 변경할 경우 README에 명시한다.
- 다크모드
  - 토글 버튼 클릭 시 테마가 전환된다.
  - 설정은 `localStorage`에 저장되어 새로고침 후에도 유지되어야 한다.
- 스크롤 애니메이션
  - `Intersection Observer`를 사용한다.
  - `threshold`는 `0.2` 이상이 권장된다.
  - 기준값을 변경할 경우 README에 명시한다.

## Contact 폼 요구사항

- 이름, 이메일, 메시지 입력 필드가 있어야 한다.
- 필수값 검증을 구현한다.
- 이메일 형식 검증을 구현한다.
- 에러 메시지는 입력 필드 근처에 표시한다.
- 제출 시 기본 동작을 방지하고 성공 메시지를 표시한다.

## ES6+ 문법 요구사항

- 화살표 함수를 적절히 사용한다.
- 템플릿 리터럴로 동적 HTML을 생성한다.
- 구조 분해 할당으로 객체 또는 배열 값을 추출한다.
- 배열 메서드를 활용한다.
  - `map`: GitHub 데이터를 HTML 카드로 변환
  - `filter`: 특정 조건의 프로젝트만 표시, 선택 사항
  - `forEach`: 배열 순회

## GitHub API 요구사항

`fetch`와 `async/await`로 GitHub API를 호출한다.

```text
https://api.github.com/users/{본인아이디}/repos
```

Projects 섹션에는 다음 상태가 UI로 표현되어야 한다.

- 로딩 상태: 스피너 또는 "로딩 중..." 텍스트
- 성공 상태: 프로젝트 카드 리스트 렌더링
- 에러 상태: "프로젝트를 불러올 수 없습니다" 메시지와 재시도 버튼
- 빈 상태: "표시할 프로젝트가 없습니다" 메시지

에러 처리는 `try/catch`로 구현한다. 인증 없이 호출할 경우 시간당 60회 제한이 있으므로, 403 응답이 발생하면 에러 상태 UI가 표시되도록 처리한다.

## 상태 관리 요구사항

"사용자 이벤트 → 상태 변경 → 화면 업데이트" 흐름이 명확해야 한다. 다음 중 3가지 이상을 구현한다.

- 다크모드 토글 → 테마 상태 변경 → 전체 화면 스타일 변경
- GitHub API 호출 → 로딩, 성공, 에러 상태 변경 → Projects 섹션 렌더링 변경
- 폼 입력 → 유효성 상태 변경 → 에러 메시지 표시 또는 숨김
- 필터 버튼 클릭 → 필터 상태 변경 → 프로젝트 목록 변경

## 배포 요구사항

- GitHub Pages로 배포한다.
- 배포된 URL에서 모든 기능이 정상 동작해야 한다.
- 확인 대상:
  - 반응형 레이아웃
  - 햄버거 메뉴
  - 다크모드
  - 스크롤 인터랙션
  - GitHub API 연동
  - 폼 유효성 검사

## 개발 환경 및 제약사항

- React, Vue, jQuery, Bootstrap, Tailwind CSS 등 외부 라이브러리 사용 금지
- 순수 `HTML`, `CSS`, `JavaScript`만 사용
- 아이콘 라이브러리와 웹 폰트는 사용 가능
- 최신 Chrome 브라우저에서 정상 동작해야 한다.
- 인라인 스타일 `style="..."` 사용 금지
- HTML 인라인 이벤트 속성 사용 금지

## 보너스 과제

- GitHub 프로젝트를 언어별로 필터링하는 기능
- Hero 섹션 타이핑 효과
- Formspree 또는 EmailJS를 사용한 실제 폼 전송
- `prefers-color-scheme`를 사용한 시스템 다크모드 감지

## 구현 체크리스트

- [x] `index.html`, `css/style.css`, `js/main.js`, `images/` 구조 생성
- [x] 시맨틱 HTML 구조 작성
- [x] 필수 섹션 6개 구현
- [x] 반응형 레이아웃 구현
- [x] 모바일 햄버거 메뉴 구현
- [x] 부드러운 스크롤 구현
- [x] 스크롤 탑 버튼 구현
- [x] 스크롤 시 네비게이션 스타일 변경
- [x] 다크모드 토글 및 `localStorage` 저장
- [x] Contact 폼 유효성 검사
- [x] GitHub API 연동
- [x] 로딩, 성공, 에러, 빈 상태 UI 구현
- [x] Intersection Observer 스크롤 애니메이션 구현
- [ ] README에 배포 URL과 스크린샷 추가
- [ ] GitHub Pages 배포

## 구현 메모

- GitHub API 사용자명: `haecho`
- 스크롤 탑 버튼 노출 기준: `300px`
- 네비게이션 배경 변경 기준: `60px`
- Intersection Observer `threshold`: `0.2`
- 보너스 구현: GitHub 저장소 언어별 필터링, Hero 타이핑 효과

## 실행 방법

브라우저에서 `index.html`을 열거나 VS Code Live Server로 실행한다.

```text
index.html
```

GitHub Pages 배포 후에는 아래 항목을 추가로 갱신한다.

- 배포 URL
- GitHub 저장소 URL
- 데스크톱 / 모바일 / 다크모드 스크린샷
