/**
 * @file scripts/check-user.ts
 * @description 특정 사용자가 데이터베이스에 있는지 확인하는 스크립트
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ 환경 변수가 설정되지 않았습니다.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkUser(userId: string) {
  console.log(`\n🔍 사용자 조회: ${userId}\n`);
  console.log("=".repeat(50));

  // 1. UUID로 조회
  console.log("\n1️⃣ UUID로 조회 시도...");
  const { data: userByUuid, error: uuidError } = await supabase
    .from("users")
    .select("id, clerk_id, name, created_at")
    .eq("id", userId)
    .maybeSingle();

  if (userByUuid) {
    console.log("✅ UUID로 사용자 찾음:");
    console.log(JSON.stringify(userByUuid, null, 2));
    return;
  } else if (uuidError) {
    console.log("❌ UUID 조회 에러:", uuidError.message);
  } else {
    console.log("⚠️ UUID로 사용자를 찾지 못함");
  }

  // 2. clerk_id로 조회
  console.log("\n2️⃣ clerk_id로 조회 시도...");
  const { data: userByClerk, error: clerkError } = await supabase
    .from("users")
    .select("id, clerk_id, name, created_at")
    .eq("clerk_id", userId)
    .maybeSingle();

  if (userByClerk) {
    console.log("✅ clerk_id로 사용자 찾음:");
    console.log(JSON.stringify(userByClerk, null, 2));
    return;
  } else if (clerkError) {
    console.log("❌ clerk_id 조회 에러:", clerkError.message);
  } else {
    console.log("⚠️ clerk_id로 사용자를 찾지 못함");
  }

  // 3. 전체 사용자 목록 확인 (최근 10명)
  console.log("\n3️⃣ 최근 가입한 사용자 10명 확인...");
  const { data: recentUsers, error: recentError } = await supabase
    .from("users")
    .select("id, clerk_id, name, created_at")
    .order("created_at", { ascending: false })
    .limit(10);

  if (recentUsers) {
    console.log(`\n📋 최근 사용자 ${recentUsers.length}명:`);
    recentUsers.forEach((user, index) => {
      console.log(
        `${index + 1}. ${user.name} (clerk_id: ${user.clerk_id}, id: ${user.id})`
      );
    });
  } else if (recentError) {
    console.log("❌ 사용자 목록 조회 에러:", recentError.message);
  }

  // 4. clerk_id에 "user_"가 포함된 사용자 확인
  console.log("\n4️⃣ clerk_id에 'user_'가 포함된 사용자 확인...");
  const { data: clerkUsers, error: clerkUsersError } = await supabase
    .from("users")
    .select("id, clerk_id, name, created_at")
    .like("clerk_id", "user_%")
    .limit(10);

  if (clerkUsers) {
    console.log(`\n📋 clerk_id가 'user_'로 시작하는 사용자 ${clerkUsers.length}명:`);
    clerkUsers.forEach((user, index) => {
      console.log(
        `${index + 1}. ${user.name} (clerk_id: ${user.clerk_id})`
      );
    });
  } else if (clerkUsersError) {
    console.log("❌ clerk_id 조회 에러:", clerkUsersError.message);
  }

  console.log("\n" + "=".repeat(50));
  console.log("\n❌ 사용자를 찾을 수 없습니다.");
}

// 명령줄 인자로 userId 받기
const userId = process.argv[2];

if (!userId) {
  console.error("❌ 사용법: pnpm tsx scripts/check-user.ts <userId>");
  console.error("예시: pnpm tsx scripts/check-user.ts user_36Y7OLfYZJMZooE2qonoxRZCuNq");
  process.exit(1);
}

checkUser(userId)
  .then(() => {
    console.log("\n✅ 조회 완료");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ 에러 발생:", error);
    process.exit(1);
  });

