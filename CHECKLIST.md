# 요구사항과 검증 기록

2026-09-23 기준. 실제 동료 평가표는 제출 후 공개되므로 이 문서는 제공된 과제 전문을 기준으로 합니다.

## 구현 매핑

| 요구사항 | 위치 / 구현 | 상태 |
|---|---|---|
| HTML/CSS/JS/images 분리 | index.html, css, js, images | 완료 |
| VS Code + Live Server | 공식 확장 5.7.10 설치, 폴더 설정 | 설치 완료; 실제 실행은 별도 로컬 서버로 확인 |
| 시맨틱 태그와 6개 섹션 | index.html | 완료 |
| 앵커, alt, label 연결 | index.html | 완료 |
| CSS 변수와 다크 테마 | :root, [data-theme="dark"] | 완료 |
| Flexbox / Grid | .nav, .project-grid | 완료 |
| 모바일 우선, 768/1024px | style.css | 완료 |
| hover, transition, box-shadow | 버튼, 카드 | 완료 |
| defer, const/let, 이벤트 리스너 | index.html, main.js | 완료 |
| DOM 선택, textContent/innerHTML | main.js | 완료 |
| classList add/remove/toggle | 애니메이션, 메뉴, 헤더 | 완료 |
| click, submit, scroll, input | main.js | 완료 |
| 햄버거 메뉴 | state.menuOpen / renderMenu | 브라우저 확인 |
| 부드러운 이동 / 맨 위 버튼 | CSS, renderScroll | 브라우저 확인 |
| 60px 헤더 / 300px 맨 위 버튼 | renderScroll | 구현 |
| 다크 모드 저장 | renderTheme / localStorage | 새로고침 유지 확인 |
| IntersectionObserver 0.2 | main.js | 구현 |
| 필수값 / 이메일 검증 | validateField / renderForm | 브라우저 확인 |
| 폼 오류 / 성공 메시지 | 필드별 오류, form-status | 브라우저 확인 |
| 화살표 함수, 템플릿 리터럴, 구조분해 | main.js | 완료 |
| map / forEach / filter | 카드 / 반복 / 오류 입력란 선별 | 완료 |
| GitHub fetch / async-await / try-catch | loadProjects | 실제 계정 10개 조회 확인 |
| 로딩 / 성공 / 오류 / 빈 목록 | renderProjects | 실제 성공 및 모의 응답 검증 |
| 오류 재시도, 403 제한 처리 | loadProjects / retry-button | 모의 응답 검증 |
| 3개 이상 상태 → 화면 흐름 | 테마, 메뉴, API, 폼 | 4개 구현 |
| GitHub Pages | 새 mission-B1-1 저장소 예정 | **로그인 대기 / 미배포** |
| README와 스크린샷 | README.md, images/*.png | 로컬 화면 저장 완료 |
| 배포 URL에서 재검증 | 배포 후 진행 | **미완료** |

## 수행한 검증

- JavaScript 문법 검사 통과.
- 로컬 HTTP 응답 200 확인.
- 브라우저에서 실제 GitHub 공개 저장소 10개 표시 확인.
- 모바일 390px 설정, 실제 콘텐츠 폭 375px에서 가로 넘침 없음.
- 데스크톱 1440px 설정, 실제 콘텐츠 폭 1425px에서 가로 넘침 없음.
- 모바일 메뉴 열기, 프로젝트 선택 후 닫힘 확인.
- 빈 폼 제출 시 3개 오류, 잘못된 이메일 오류, 올바른 입력 성공 확인.
- 다크 모드 적용 후 새로고침해 dark 유지 확인.
- 로딩, 빈 목록, 403/404/429/500, 네트워크 오류, 재시도 복구, 페이지네이션을 별도 모의 응답 테스트로 확인.
- 외부 문자열 `<script>` 등이 태그로 삽입되지 않고 이스케이프되는지 확인.
- 데스크톱·모바일·다크 모드 스크린샷 저장.

브라우저 확인은 Codex 내장 브라우저에서 수행했습니다. 설치된 최신 Chrome에서의 별도 확인과 배포 URL 검증은 남아 있습니다. API 실패/빈 목록 등은 서버 상황을 강제로 바꾸지 않고 모의 응답으로 검증했습니다.

## 제출 직전 남은 일

1. GitHub 로그인.
2. 새 `mission-B1-1` 저장소 생성 및 파일 업로드.
3. GitHub Pages 배포와 배포 주소 검증.
4. README에 실제 저장소/배포 주소 기록.
5. 플랫폼에 제출한 후 공개된 평가항목으로 추가 점검.

선택 과제(언어별 프로젝트 필터, 타이핑 효과, 실제 메일 발송, 시스템 다크 모드 자동 감지)는 구현하지 않았습니다. 필수 흐름을 먼저 이해할 수 있도록 범위를 정했습니다.
