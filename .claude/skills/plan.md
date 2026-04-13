---
name: plan
description: /discuss 이후 구현 계획 수립. 각 step을 atomic task로 분해. 코드를 절대 작성하지 않는다.
---

## 전제: /discuss로 의도 정렬 완료

다음 순서로 계획 수립:

1. 영향받는 파일/컬렉션/라우트 나열
2. 구현 순서를 atomic task로 분해 (각 2~5분)
3. 각 task의 **완료 기준** 명시
4. TODO.md에 추가할 형태로 출력

## 출력 형식

```
## Feature: {기능명}

### 영향 범위
- DB: {Firestore 컬렉션 변경}
- Routes: {새 라우트/수정 라우트}
- Components: {새 컴포넌트/수정 컴포넌트}

### 구현 계획
1. [ ] {task} — 완료기준: {구체적}
2. [ ] {task} — 완료기준: {구체적}
```

**절대 하지 않을 것**: 코드 작성, 파일 생성
