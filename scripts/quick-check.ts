/**
 * @file scripts/quick-check.ts
 * @description 빠른 상태 확인 스크립트
 */

import { createClient } from '@supabase/supabase-js';
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

async function quickCheck() {
  try {
    // 데모 유저 수
    const { data: users } = await supabase
      .from('users')
      .select('id')
      .like('clerk_id', 'demo_user_%');
    
    const userCount = users?.length || 0;
    console.log(`👥 데모 유저: ${userCount}명`);

    if (userCount === 0) {
      console.log('⚠️  아직 유저가 생성되지 않았습니다.');
      return;
    }

    const userIds = users?.map(u => u.id) || [];

    // 게시물 수
    const { data: posts } = await supabase
      .from('posts')
      .select('id')
      .in('user_id', userIds);
    
    const postCount = posts?.length || 0;
    console.log(`📸 게시물: ${postCount}개`);

    // 팔로우 관계 수 (count 사용)
    const { count: followCount } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .in('follower_id', userIds);
    const expected = userCount * 25; // 평균 예상값
    const progress = Math.min(100, Math.round((followCount / expected) * 100));

    console.log(`👥 팔로우 관계: ${followCount}개`);
    console.log(`📊 진행률: ${progress}% (예상: ${expected}개)`);
    
    // 좋아요 수 (count 사용)
    const postIds = posts?.map(p => p.id) || [];
    const { count: likeCount } = await supabase
      .from('likes')
      .select('*', { count: 'exact', head: true })
      .in('post_id', postIds);
    
    console.log(`❤️  좋아요: ${likeCount || 0}개`);

    // 댓글 수 (count 사용)
    const { count: commentCount } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .in('post_id', postIds);
    
    console.log(`💬 댓글: ${commentCount || 0}개`);

  } catch (error) {
    console.error('❌ 오류:', error);
  }
}

quickCheck();

