/**
 * @file scripts/seed-follows-only.ts
 * @description 팔로우 관계만 생성하는 스크립트
 */

import { createClient } from '@supabase/supabase-js';
import { faker } from '@faker-js/faker';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 환경 변수 오류');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const FOLLOWS_PER_USER_MIN = 10;
const FOLLOWS_PER_USER_MAX = 40;

async function createFollows() {
  console.log('👥 팔로우 관계 생성 시작...\n');

  // 데모 유저 가져오기
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('id, created_at')
    .like('clerk_id', 'demo_user_%')
    .order('clerk_id', { ascending: true });

  if (usersError || !users) {
    console.error('❌ 유저 조회 실패:', usersError);
    return;
  }

  console.log(`📋 ${users.length}명의 유저 확인됨\n`);

  // 인기 유저 선정 (상위 20%)
  const popularUserCount = Math.floor(users.length * 0.2);
  const popularUsers = users.slice(0, popularUserCount);

  const follows: Array<{
    follower_id: string;
    following_id: string;
    created_at: string;
  }> = [];

  // 각 유저마다 팔로우 관계 생성
  for (let userIndex = 0; userIndex < users.length; userIndex++) {
    const user = users[userIndex];
    
    // 진행률 표시 (5명마다)
    if (userIndex % 5 === 0 || userIndex === users.length - 1) {
      const percent = Math.round(((userIndex + 1) / users.length) * 100);
      console.log(`   진행 중... ${userIndex + 1}/${users.length}명 (${percent}%) - 팔로우 ${follows.length}개 생성됨`);
    }
    
    const followCount = faker.number.int({
      min: FOLLOWS_PER_USER_MIN,
      max: FOLLOWS_PER_USER_MAX
    });
    
    // 팔로우할 유저 선택 (더 빠른 방식)
    const candidates = users.filter(u => u.id !== user.id);
    const selectedIds = new Set<string>();
    
    // 인기 유저를 먼저 일부 선택
    const popularCount = Math.floor(followCount * 0.3);
    const availablePopular = popularUsers.filter(u => u.id !== user.id);
    const selectedPopular = faker.helpers.arrayElements(
      availablePopular,
      Math.min(popularCount, availablePopular.length)
    );
    selectedPopular.forEach(u => selectedIds.add(u.id));
    
    // 나머지는 일반 유저에서 선택
    const remaining = followCount - selectedIds.size;
    const availableCandidates = candidates.filter(u => !selectedIds.has(u.id));
    const selectedCandidates = faker.helpers.arrayElements(
      availableCandidates,
      Math.min(remaining, availableCandidates.length)
    );
    selectedCandidates.forEach(u => selectedIds.add(u.id));
    
    // 팔로우 관계 생성
    selectedIds.forEach(targetId => {
      follows.push({
        follower_id: user.id,
        following_id: targetId,
        created_at: faker.date.between({
          from: new Date(user.created_at),
          to: new Date()
        }).toISOString(),
      });
    });
  }

  console.log(`\n💾 데이터베이스에 삽입 중... (총 ${follows.length}개)`);
  
  // 배치로 삽입 (100개씩)
  const batchSize = 100;
  let inserted = 0;
  
  for (let i = 0; i < follows.length; i += batchSize) {
    const batch = follows.slice(i, i + batchSize);
    const { error } = await supabase.from('follows').insert(batch);
    
    if (error) {
      // UNIQUE 제약조건 위반은 무시 (이미 팔로우 중)
      if (!error.message.includes('duplicate') && !error.message.includes('unique')) {
        console.error('❌ 팔로우 관계 생성 실패:', error);
        throw error;
      }
    } else {
      inserted += batch.length;
    }
    
    // 배치 삽입 진행률 표시 (100개마다)
    const totalInserted = Math.min(i + batchSize, follows.length);
    const percent = Math.round((totalInserted / follows.length) * 100);
    if (i % 100 === 0 || totalInserted === follows.length) {
      console.log(`   삽입 진행 중... ${totalInserted}/${follows.length}개 (${percent}%)`);
    }
  }

  console.log(`\n✅ ${inserted}개의 팔로우 관계 생성 완료!`);
}

createFollows().catch(console.error);

