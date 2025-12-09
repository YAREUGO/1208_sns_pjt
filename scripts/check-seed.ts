/**
 * @file scripts/check-seed.ts
 * @description 시드 데이터 생성 상태 확인 스크립트
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

async function checkSeedData() {
  console.log('🔍 시드 데이터 상태 확인 중...\n');

  try {
    // 데모 유저 확인
    const { data: demoUsers, error: usersError } = await supabase
      .from('users')
      .select('id')
      .like('clerk_id', 'demo_user_%');

    if (usersError) {
      console.error('❌ 유저 조회 실패:', usersError);
      return;
    }

    const userCount = demoUsers?.length || 0;
    console.log(`👥 데모 유저: ${userCount}명`);

    if (userCount === 0) {
      console.log('\n⚠️  아직 시드 데이터가 생성되지 않았습니다.');
      console.log('   pnpm seed:demo --reset 명령을 실행하세요.');
      return;
    }

    // 게시물 확인
    const userIds = demoUsers?.map(u => u.id) || [];
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('id')
      .in('user_id', userIds);

    if (postsError) {
      console.error('❌ 게시물 조회 실패:', postsError);
      return;
    }

    const postCount = posts?.length || 0;
    console.log(`📸 게시물: ${postCount}개`);

    // 팔로우 관계 확인
    const { data: follows, error: followsError } = await supabase
      .from('follows')
      .select('id')
      .in('follower_id', userIds);

    if (followsError) {
      console.error('❌ 팔로우 관계 조회 실패:', followsError);
      return;
    }

    const followCount = follows?.length || 0;
    console.log(`👥 팔로우 관계: ${followCount}개`);

    // 좋아요 확인
    const postIds = posts?.map(p => p.id) || [];
    const { data: likes, error: likesError } = await supabase
      .from('likes')
      .select('id')
      .in('post_id', postIds);

    if (likesError) {
      console.error('❌ 좋아요 조회 실패:', likesError);
      return;
    }

    const likeCount = likes?.length || 0;
    console.log(`❤️  좋아요: ${likeCount}개`);

    // 댓글 확인
    const { data: comments, error: commentsError } = await supabase
      .from('comments')
      .select('id')
      .in('post_id', postIds);

    if (commentsError) {
      console.error('❌ 댓글 조회 실패:', commentsError);
      return;
    }

    const commentCount = comments?.length || 0;
    console.log(`💬 댓글: ${commentCount}개`);

    console.log('\n✅ 데이터 확인 완료!');
    
    // 예상 데이터와 비교
    const expectedUsers = 50;
    const expectedPostsMin = expectedUsers * 3; // 최소 150개
    const expectedPostsMax = expectedUsers * 8; // 최대 400개
    
    if (userCount === expectedUsers && postCount >= expectedPostsMin) {
      console.log('\n🎉 모든 데이터가 정상적으로 생성되었습니다!');
    } else if (userCount < expectedUsers || postCount < expectedPostsMin) {
      console.log('\n⚠️  데이터 생성이 완료되지 않은 것 같습니다.');
      console.log('   시드 스크립트가 아직 실행 중일 수 있습니다.');
    }

  } catch (error) {
    console.error('❌ 에러 발생:', error);
  }
}

checkSeedData();

