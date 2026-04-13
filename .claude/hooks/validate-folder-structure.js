// 발동: Write (새 파일 생성) 시
// 종료: 올바른 폴더에 생성
// 금지: 잘못된 위치에 파일 생성

let data = "";
process.stdin.on("data", (chunk) => (data += chunk));
process.stdin.on("end", () => {
  const input = JSON.parse(data);
  const filePath = input.tool_input?.file_path || "";

  const rules = [
    {
      pattern: /\.types\.ts$/,
      allowed: /[/\\]src[/\\]types[/\\]/,
      msg: "타입 파일은 src/types/ 에만 생성",
    },
    {
      pattern: /use[A-Z].*\.ts$/,
      allowed: /[/\\]src[/\\](hooks|components)[/\\]/,
      msg: "커스텀 훅은 src/hooks/ 또는 해당 컴포넌트 폴더에만 생성",
    },
    {
      pattern: /firebase.*\.ts$/,
      allowed: /[/\\]src[/\\]lib[/\\]/,
      msg: "Firebase 관련 파일은 src/lib/ 에만 생성",
    },
    {
      pattern: /actions\.ts$/,
      allowed: /[/\\](app|src[/\\]actions)[/\\]/,
      msg: "Server Action은 app/ 또는 src/actions/ 에만 생성",
    },
  ];

  for (const rule of rules) {
    if (rule.pattern.test(filePath) && !rule.allowed.test(filePath)) {
      console.error(`[Hook] ❌ BLOCKED: ${rule.msg}`);
      console.error(`  시도한 위치: ${filePath}`);
      process.exit(2);
    }
  }

  console.log(data);
});
