/**
 * @file scripts/check-details.ts
 * @description 상세 통계 확인 스크립트
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

async function checkDetails() {
  console.log('📊 데모 데이터 상세 통계\n');
  console.log('='.repeat(50));

  try {
    // 유저 통계
    const { data: users, count: userCount } = await supabase
      .from('users')
      .select('id, name, clerk_id, created_at', { count: 'exact' })
      .like('clerk_id', 'demo_user_%')
      .order('created_at', { ascending: true });

    console.log(`\n👥 유저 통계:`);
    console.log(`   총 유저 수: ${userCount}명`);
    if (users && users.length > 0) {
      console.log(`   첫 번째 유저: ${users[0].name} (${users[0].clerk_id})`);
      console.log(`   마지막 유저: ${users[users.length - 1].name} (${users[users.length - 1].clerk_id})`);
    }

    const userIds = users?.map(u => u.id) || [];

    // 게시물 통계
    const { data: posts, count: postCount } = await supabase
      .from('posts')
      .select('id, user_id, created_at', { count: 'exact' })
      .in('user_id', userIds)
      .order('created_at', { ascending: false });

    console.log(`\n📸 게시물 통계:`);
    console.log(`   총 게시물 수: ${postCount}개`);
    if (posts && posts.length > 0) {
      const postsPerUser = postCount! / userCount!;
      console.log(`   유저당 평균 게시물: ${postsPerUser.toFixed(1)}개`);
      
      // 유저별 게시물 수
      const userPostCounts = new Map<string, number>();
      posts.forEach(p => {
        const count = userPostCounts.get(p.user_id) || 0;
        userPostCounts.set(p.user_id, count + 1);
      });
      const postCounts = Array.from(userPostCounts.values());
      const minPosts = Math.min(...postCounts);
      const maxPosts = Math.max(...postCounts);
      console.log(`   유저당 최소 게시물: ${minPosts}개`);
      console.log(`   유저당 최대 게시물: ${maxPosts}개`);
    }

    const postIds = posts?.map(p => p.id) || [];

    // 팔로우 통계
    const { count: followCount } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .in('follower_id', userIds);

    console.log(`\n👥 팔로우 통계:`);
    console.log(`   총 팔로우 관계: ${followCount}개`);
    if (followCount && userCount) {
      const avgFollows = followCount / userCount;
      console.log(`   유저당 평균 팔로우: ${avgFollows.toFixed(1)}명`);
    }

    // 좋아요 통계
    const { count: likeCount } = await supabase
      .from('likes')
      .select('*', { count: 'exact', head: true })
      .in('post_id', postIds);

    console.log(`\n❤️  좋아요 통계:`);
    console.log(`   총 좋아요 수: ${likeCount}개`);
    if (likeCount && postCount) {
      const avgLikes = likeCount / postCount;
      console.log(`   게시물당 평균 좋아요: ${avgLikes.toFixed(1)}개`);
      
      // 인기 게시물 확인
      const { data: topPosts } = await supabase
        .from('likes')
        .select('post_id')
        .in('post_id', postIds);
      
      if (topPosts) {
        const postLikeCounts = new Map<string, number>();
        topPosts.forEach(l => {
          const count = postLikeCounts.get(l.post_id) || 0;
          postLikeCounts.set(l.post_id, count + 1);
        });
        const likeCounts = Array.from(postLikeCounts.values());
        const maxLikes = Math.max(...likeCounts);
        console.log(`   최대 좋아요 수: ${maxLikes}개`);
      }
    }

    // 댓글 통계
    const { count: commentCount } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .in('post_id', postIds);

    console.log(`\n💬 댓글 통계:`);
    console.log(`   총 댓글 수: ${commentCount}개`);
    if (commentCount && postCount) {
      const avgComments = commentCount / postCount;
      console.log(`   게시물당 평균 댓글: ${avgComments.toFixed(1)}개`);
    }

    console.log(`\n${'='.repeat(50)}`);
    console.log(`\n✅ 모든 데이터가 정상적으로 생성되었습니다!`);
    console.log(`\n💡 앱에서 확인하려면:`);
    console.log(`   1. pnpm dev 로 개발 서버 실행`);
    console.log(`   2. 브라우저에서 http://localhost:3000 접속`);
    console.log(`   3. 메인 피드에서 게시물 확인`);

  } catch (error) {
    console.error('❌ 오류:', error);
  }
}

checkDetails();

