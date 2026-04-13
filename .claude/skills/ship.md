---
name: ship
description: lint + type-check + commit 한 번에. 하나라도 실패하면 중단.
---

순서대로 실행, 실패 시 즉시 중단:

| Step | 명령                       | 실패 시             |
| ---- | -------------------------- | ------------------- |
| 1    | `npx tsc --noEmit`         | 타입 에러 수정      |
| 2    | `npx next lint`            | lint 에러 수정      |
| 3    | `git add -A && git commit` | conventional commit |
| 4    | TODO.md 업데이트           | 체크 표시           |

**절대 하지 않을 것**: 실패 상태에서 커밋, `--no-verify` 사용
