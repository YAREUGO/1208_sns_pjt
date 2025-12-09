/**
 * @file scripts/apply-profile-image-migration.ts
 * @description users 테이블에 profile_image_url 컬럼을 추가하는 스크립트
 */

import "dotenv/config";
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

// .env.local 파일 로드
config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("❌ 환경 변수가 설정되지 않았습니다.");
  console.error("   NEXT_PUBLIC_SUPABASE_URL과 SUPABASE_SERVICE_ROLE_KEY를 확인하세요.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function main() {
  console.log("🔧 users 테이블에 profile_image_url 컬럼 추가 중...\n");

  // 먼저 컬럼이 있는지 확인
  const { data: testData, error: testError } = await supabase
    .from("users")
    .select("id, name, profile_image_url")
    .limit(1);

  if (testError) {
    if (testError.message.includes("does not exist")) {
      console.log("⚠️ profile_image_url 컬럼이 존재하지 않습니다.");
      console.log("\n📋 Supabase 대시보드 SQL Editor에서 다음 SQL을 실행하세요:\n");
      console.log("  ALTER TABLE public.users ADD COLUMN profile_image_url TEXT;");
      console.log("\n또는 다음 명령어로 마이그레이션을 적용하세요:");
      console.log("  supabase migration up");
      console.log("\n마이그레이션 파일 위치:");
      console.log("  supabase/migrations/20250108000004_add_profile_image.sql");
      process.exit(1);
    } else {
      console.error("❌ 테이블 조회 에러:", testError.message);
      process.exit(1);
    }
  } else {
    console.log("✅ profile_image_url 컬럼이 이미 존재합니다!");
    if (testData && testData.length > 0) {
      console.log("   샘플 데이터:", testData[0]);
    }
    console.log("\n✨ 프로필 이미지 기능을 사용할 수 있습니다!");
  }
}

main();

