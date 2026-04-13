// 발동: Write|Edit 시 (.ts/.tsx)
// 종료: 파일이 300줄 이하
// 금지: 300줄 초과 파일 생성/수정

let data = "";
process.stdin.on("data", (chunk) => (data += chunk));
process.stdin.on("end", () => {
  const input = JSON.parse(data);
  const content =
    input.tool_input?.content || input.tool_input?.new_string || "";
  const filePath = input.tool_input?.file_path || input.tool_input?.path || "";

  if (!filePath.match(/\.(ts|tsx)$/)) {
    console.log(data);
    return;
  }

  const lineCount = content.split("\n").length;

  if (lineCount > 300) {
    console.error(
      `[Hook] ❌ BLOCKED: ${filePath} is ${lineCount} lines (limit: 300).`,
    );
    console.error(`[Hook] 파일을 분리하세요:`);
    console.error(`  - 컴포넌트 → 하위 컴포넌트로 분리`);
    console.error(`  - 로직 → 커스텀 훅 (use*.ts)으로 추출`);
    console.error(`  - 유틸리티 → lib/ 폴더로 분리`);
    console.error(`  - 타입 → *.types.ts로 분리`);
    process.exit(2);
  }

  if (lineCount > 200) {
    console.error(
      `[Hook] ⚠️ WARNING: ${filePath} is ${lineCount} lines. 200줄 초과 — 분리 고려.`,
    );
  }

  console.log(data);
});
