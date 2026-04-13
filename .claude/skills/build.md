---
name: build
description: /plan 기반 구현 실행. TODO.md 미완료 항목을 순서대로. 한 번에 하나의 task만.
---

1. TODO.md 읽기 → 다음 미완료 항목 확인
2. **해당 항목만** 구현 (한 세션 = 한 태스크)
3. 구현 후 자체 검증:
   - `npx tsc --noEmit` 통과
   - 관련 테스트 실행 + 통과 (있다면)
4. 통과 → TODO.md 체크 → git commit (conventional commit)
5. 실패 → 수정 후 재검증

## Commit 메시지

| 접두사      | 용도         |
| ----------- | ------------ |
| `feat:`     | 새 기능      |
| `fix:`      | 버그 수정    |
| `refactor:` | 리팩터링     |
| `chore:`    | 설정, 의존성 |

**절대 하지 않을 것**: 다음 태스크로 건너뛰기, 여러 태스크 한꺼번에
