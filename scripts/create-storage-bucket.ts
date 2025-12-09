/**
 * @file scripts/create-storage-bucket.ts
 * @description Storage 버킷 생성 스크립트
 *
 * 실행 방법:
 * pnpm tsx scripts/create-storage-bucket.ts
 *
 * 이 스크립트는 Supabase Storage에 'uploads' 버킷을 생성합니다.
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// 환경 변수 로드
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 환경 변수가 설정되지 않았습니다.');
  console.error('NEXT_PUBLIC_SUPABASE_URL과 SUPABASE_SERVICE_ROLE_KEY를 확인하세요.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createStorageBucket() {
  console.log('🚀 Storage 버킷 생성 시작...\n');

  try {
    // 1. 기존 버킷 확인
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('❌ 버킷 목록 조회 실패:', listError);
      throw listError;
    }

    console.log('📋 현재 버킷 목록:');
    if (buckets && buckets.length > 0) {
      buckets.forEach(bucket => {
        console.log(`   - ${bucket.id} (public: ${bucket.public})`);
      });
    } else {
      console.log('   (버킷이 없습니다)');
    }
    console.log('');

    // 2. uploads 버킷이 이미 존재하는지 확인
    const uploadsBucket = buckets?.find(b => b.id === 'uploads');
    
    if (uploadsBucket) {
      console.log('✅ uploads 버킷이 이미 존재합니다.');
      console.log(`   - 이름: ${uploadsBucket.name}`);
      console.log(`   - 공개: ${uploadsBucket.public}`);
      console.log(`   - 파일 크기 제한: ${uploadsBucket.file_size_limit ? `${Math.round(uploadsBucket.file_size_limit / 1024 / 1024)}MB` : '없음'}`);
      return;
    }

    // 3. 버킷 생성 (SQL을 통한 생성은 제한적이므로, 여기서는 확인만)
    console.log('⚠️  uploads 버킷이 존재하지 않습니다.');
    console.log('');
    console.log('📝 다음 중 하나의 방법으로 버킷을 생성하세요:');
    console.log('');
    console.log('방법 1: Supabase Dashboard 사용 (권장)');
    console.log('   1. https://supabase.com/dashboard 접속');
    console.log('   2. 프로젝트 선택');
    console.log('   3. Storage 메뉴 클릭');
    console.log('   4. "New bucket" 클릭');
    console.log('   5. Name: uploads');
    console.log('   6. Public bucket: 체크 해제 (private)');
    console.log('   7. File size limit: 6MB');
    console.log('   8. "Create bucket" 클릭');
    console.log('');
    console.log('방법 2: SQL Editor에서 실행');
    console.log('   1. Supabase Dashboard → SQL Editor');
    console.log('   2. 다음 SQL 실행:');
    console.log('');
    console.log('   INSERT INTO storage.buckets (id, name, public, file_size_limit)');
    console.log('   VALUES (\'uploads\', \'uploads\', false, 6291456)');
    console.log('   ON CONFLICT (id) DO NOTHING;');
    console.log('');

  } catch (error) {
    console.error('❌ 에러 발생:', error);
    process.exit(1);
  }
}

createStorageBucket();

