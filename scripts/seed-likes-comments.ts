/**
 * @file scripts/seed-likes-comments.ts
 * @description 좋아요와 댓글만 생성하는 스크립트
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

async function createLikesAndComments() {
  console.log('❤️  좋아요 및 댓글 생성 시작...\n');

  // 데모 유저 가져오기
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('id')
    .like('clerk_id', 'demo_user_%');

  if (usersError || !users) {
    console.error('❌ 유저 조회 실패:', usersError);
    return;
  }

  const userIds = users.map(u => u.id);

  // 게시물 가져오기
  const { data: posts, error: postsError } = await supabase
    .from('posts')
    .select('id, user_id, created_at')
    .in('user_id', userIds)
    .order('created_at', { ascending: false });

  if (postsError || !posts) {
    console.error('❌ 게시물 조회 실패:', postsError);
    return;
  }

  console.log(`📋 ${posts.length}개의 게시물 확인됨\n`);

  // 인기 게시물 선정 (상위 30%)
  const popularPostCount = Math.floor(posts.length * 0.3);
  const popularPosts = posts.slice(0, popularPostCount);
  const popularPostIds = new Set(popularPosts.map(p => p.id));

  // 좋아요 생성
  console.log('❤️  좋아요 생성 중...');
  const likes: Array<{
    post_id: string;
    user_id: string;
    created_at: string;
  }> = [];

  for (let postIndex = 0; postIndex < posts.length; postIndex++) {
    const post = posts[postIndex];
    
    // 진행률 표시 (50개마다)
    if (postIndex % 50 === 0 || postIndex === posts.length - 1) {
      const percent = Math.round(((postIndex + 1) / posts.length) * 100);
      console.log(`   진행 중... ${postIndex + 1}/${posts.length}개 게시물 (${percent}%) - 좋아요 ${likes.length}개 생성됨`);
    }
    
    const isPopular = popularPostIds.has(post.id);
    const likeCount = isPopular
      ? faker.number.int({ min: 20, max: 150 })
      : faker.number.int({ min: 0, max: 50 });
    
    const candidates = users.filter(u => u.id !== post.user_id);
    const selected = faker.helpers.arrayElements(candidates, Math.min(likeCount, candidates.length));
    
    selected.forEach(user => {
      likes.push({
        post_id: post.id,
        user_id: user.id,
        created_at: faker.date.between({
          from: new Date(post.created_at),
          to: new Date()
        }).toISOString(),
      });
    });
  }

  // 좋아요 삽입
  console.log(`\n💾 좋아요 삽입 중... (총 ${likes.length}개)`);
  const batchSize = 100;
  for (let i = 0; i < likes.length; i += batchSize) {
    const batch = likes.slice(i, i + batchSize);
    const { error } = await supabase.from('likes').insert(batch);
    
    if (error && !error.message.includes('duplicate') && !error.message.includes('unique')) {
      console.error('❌ 좋아요 생성 실패:', error);
    }
    
    if (i % 500 === 0 || i + batchSize >= likes.length) {
      const inserted = Math.min(i + batchSize, likes.length);
      const percent = Math.round((inserted / likes.length) * 100);
      console.log(`   삽입 진행 중... ${inserted}/${likes.length}개 (${percent}%)`);
    }
  }
  console.log(`✅ ${likes.length}개의 좋아요 생성 완료\n`);

  // 댓글 생성
  console.log('💬 댓글 생성 중...');
  const comments: Array<{
    post_id: string;
    user_id: string;
    content: string;
    created_at: string;
  }> = [];

  // 일부 유저는 lurking (댓글 거의 안 달기)
  const lurkingUserCount = Math.floor(users.length * 0.2);
  const lurkingUsers = users.slice(-lurkingUserCount);
  const lurkingUserIds = new Set(lurkingUsers.map(u => u.id));

  for (let postIndex = 0; postIndex < posts.length; postIndex++) {
    const post = posts[postIndex];
    
    // 진행률 표시 (50개마다)
    if (postIndex % 50 === 0 || postIndex === posts.length - 1) {
      const percent = Math.round(((postIndex + 1) / posts.length) * 100);
      console.log(`   진행 중... ${postIndex + 1}/${posts.length}개 게시물 (${percent}%) - 댓글 ${comments.length}개 생성됨`);
    }
    
    const isPopular = popularPostIds.has(post.id);
    const commentCount = isPopular
      ? faker.number.int({ min: 5, max: 30 })
      : faker.number.int({ min: 0, max: 10 });
    
    const candidates = users.filter(u => u.id !== post.user_id && !lurkingUserIds.has(u.id));
    const selected = faker.helpers.arrayElements(candidates, Math.min(commentCount, candidates.length));
    
    selected.forEach(user => {
      const commentTemplates = [
        faker.lorem.sentence(),
        `${faker.lorem.words(3)}!`,
        `👍 ${faker.lorem.words(2)}`,
        `❤️ ${faker.lorem.sentence()}`,
      ];
      const content = faker.helpers.arrayElement(commentTemplates);
      
      comments.push({
        post_id: post.id,
        user_id: user.id,
        content: content.length > 500 ? content.substring(0, 500) : content,
        created_at: faker.date.between({
          from: new Date(post.created_at),
          to: new Date()
        }).toISOString(),
      });
    });
  }

  // 댓글 삽입
  console.log(`\n💾 댓글 삽입 중... (총 ${comments.length}개)`);
  for (let i = 0; i < comments.length; i += batchSize) {
    const batch = comments.slice(i, i + batchSize);
    const { error } = await supabase.from('comments').insert(batch);
    
    if (error) {
      console.error('❌ 댓글 생성 실패:', error);
    }
    
    if (i % 200 === 0 || i + batchSize >= comments.length) {
      const inserted = Math.min(i + batchSize, comments.length);
      const percent = Math.round((inserted / comments.length) * 100);
      console.log(`   삽입 진행 중... ${inserted}/${comments.length}개 (${percent}%)`);
    }
  }
  console.log(`✅ ${comments.length}개의 댓글 생성 완료\n`);

  console.log('🎉 모든 작업 완료!');
}

createLikesAndComments().catch(console.error);

