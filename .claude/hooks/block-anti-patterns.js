// 발동: Write|Edit 시 (.ts/.tsx)
// 종료: 안티패턴 없음
// 금지: any, console.log, @ts-ignore, Pages Router 패턴, Firebase client SDK

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

  const violations = [];

  // TypeScript 안티패턴
  if (/:\s*any[\s;,\)>]/.test(content)) {
    violations.push("`any` 타입 사용 금지 → 구체적 타입 또는 `unknown` 사용");
  }
  if (
    /console\.(log|debug|info)\(/.test(content) &&
    !filePath.includes(".test.")
  ) {
    violations.push("`console.log` 금지 → 디버깅 후 제거");
  }
  if (/@ts-ignore|@ts-expect-error/.test(content)) {
    violations.push("`@ts-ignore` 금지 → 타입 정의 수정");
  }

  // Next.js 안티패턴
  if (/getServerSideProps|getStaticProps|getInitialProps/.test(content)) {
    violations.push("Pages Router 문법 금지 → App Router 패턴 사용");
  }
  if (/export\s+\*\s+from/.test(content)) {
    violations.push("barrel export 금지 → 직접 import");
  }

  // Firebase 안티패턴
  if (
    /from\s+["']firebase\//.test(content) &&
    !filePath.includes("firebase-client")
  ) {
    violations.push("Firebase Client SDK 직접 사용 주의 → Admin SDK 우선");
  }
  if (/FIREBASE_PRIVATE_KEY/.test(content) && /NEXT_PUBLIC/.test(content)) {
    violations.push("FIREBASE_PRIVATE_KEY를 NEXT_PUBLIC으로 노출 금지");
  }

  if (violations.length > 0) {
    console.error(
      `[Hook] ❌ BLOCKED: ${filePath} — 안티패턴 ${violations.length}건:`,
    );
    violations.forEach((v, i) => console.error(`  ${i + 1}. ${v}`));
    process.exit(2);
  }

  console.log(data);
});
