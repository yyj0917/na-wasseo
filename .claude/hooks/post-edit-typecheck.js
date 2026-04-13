// 발동: Write|Edit 후 (.ts/.tsx)
// 종료: tsc --noEmit 통과
// 금지: (non-blocking, 경고만)

const { execSync } = require("child_process");

let data = "";
process.stdin.on("data", (chunk) => (data += chunk));
process.stdin.on("end", () => {
  const input = JSON.parse(data);
  const filePath = input.tool_input?.file_path || input.tool_input?.path || "";

  if (!filePath.match(/\.(ts|tsx)$/)) {
    console.log(data);
    return;
  }

  try {
    execSync("npx tsc --noEmit --pretty 2>&1 | head -20", {
      encoding: "utf-8",
      timeout: 25000,
    });
    console.error("[Hook] ✅ TypeScript: no errors");
  } catch (e) {
    console.error(
      `[Hook] ⚠️ TypeScript 에러 감지:\n${e.stdout?.slice(0, 500) || ""}`,
    );
  }

  console.log(data);
});
