/**
 * @file scripts/check-follows.ts
 * @description 팔로우 관계 생성 상태 확인 스크립트
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
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkFollows() {
  console.log('🔍 데모 팔로우 관계 생성 상태 확인 중...\n');

  try {
    // 데모 유저 확인
    const { data: demoUsers, error: usersError } = await supabase
      .from('users')
      .select('id, clerk_id, name')
      .like('clerk_id', 'demo_user_%')
      .order('clerk_id', { ascending: true });

    if (usersError) {
      console.error('❌ 유저 조회 실패:', usersError);
      return;
    }

    const userCount = demoUsers?.length || 0;
    console.log(`👥 데모 유저: ${userCount}명\n`);

    if (userCount === 0) {
      console.log('⚠️  아직 데모 유저가 생성되지 않았습니다.');
      return;
    }

    const userIds = demoUsers?.map(u => u.id) || [];

    // 팔로우 관계 확인
    const { data: follows, error: followsError } = await supabase
      .from('follows')
      .select('follower_id, following_id')
      .in('follower_id', userIds);

    if (followsError) {
      console.error('❌ 팔로우 관계 조회 실패:', followsError);
      return;
    }

    const followCount = follows?.length || 0;
    console.log(`👥 팔로우 관계: ${followCount}개\n`);

    // 유저별 팔로우 통계
    const followStats = new Map<string, number>();
    follows?.forEach(f => {
      const count = followStats.get(f.follower_id) || 0;
      followStats.set(f.follower_id, count + 1);
    });

    console.log('📊 유저별 팔로우 통계:');
    console.log('   (상위 10명만 표시)\n');

    const sortedStats = Array.from(followStats.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    sortedStats.forEach(([userId, count], index) => {
      const user = demoUsers?.find(u => u.id === userId);
      const userName = user?.name || 'Unknown';
      const clerkId = user?.clerk_id || 'Unknown';
      console.log(`   ${index + 1}. ${userName} (${clerkId}): ${count}명 팔로우`);
    });

    // 예상 팔로우 수 계산
    const expectedMin = userCount * 10; // 최소 10명씩
    const expectedMax = userCount * 40; // 최대 40명씩
    const expectedAvg = userCount * 25; // 평균 25명씩

    console.log(`\n📈 예상 범위:`);
    console.log(`   최소: ${expectedMin}개 (각 유저당 10명)`);
    console.log(`   평균: ${expectedAvg}개 (각 유저당 25명)`);
    console.log(`   최대: ${expectedMax}개 (각 유저당 40명)`);

    const progress = Math.min(100, Math.round((followCount / expectedAvg) * 100));
    console.log(`\n📊 진행률: ${progress}% (${followCount}/${expectedAvg}개)`);

    if (followCount < expectedMin) {
      console.log('\n⚠️  아직 팔로우 관계 생성이 진행 중인 것 같습니다.');
    } else if (followCount >= expectedMin && followCount < expectedAvg) {
      console.log('\n🔄 팔로우 관계 생성이 진행 중입니다...');
    } else {
      console.log('\n✅ 팔로우 관계 생성이 거의 완료되었습니다!');
    }

  } catch (error) {
    console.error('❌ 에러 발생:', error);
  }
}

checkFollows();

