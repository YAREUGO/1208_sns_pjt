/**
 * @file scripts/seed-demo.ts
 * @description 데모용 시드 데이터 생성 스크립트
 *
 * 실행 방법:
 * pnpm seed:demo [--reset]  // --reset 플래그로 기존 데이터 삭제
 *
 * 생성 데이터:
 * - 50명의 데모 유저 (users 테이블)
 * - 각 유저당 3~8개 게시물
 * - 팔로우 관계 (10~40명 랜덤)
 * - 좋아요 및 댓글 (인기 유저/게시물에 몰리도록)
 */

import { createClient } from "@supabase/supabase-js";
import { faker } from "@faker-js/faker";
import * as dotenv from "dotenv";

// 환경 변수 로드 (.env.local 우선, 없으면 .env)
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

// Supabase 클라이언트 생성 (Service Role 사용)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ 환경 변수가 설정되지 않았습니다.");
  console.error(
    "NEXT_PUBLIC_SUPABASE_URL과 SUPABASE_SERVICE_ROLE_KEY를 확인하세요.",
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// 타입 정의
interface DemoUser {
  id: string;
  clerk_id: string;
  name: string;
  created_at: string;
}

interface DemoPost {
  id: string;
  user_id: string;
  image_url: string;
  caption: string | null;
  created_at: string;
}

// 설정
const DEMO_USER_COUNT = 50;
const POSTS_PER_USER_MIN = 3;
const POSTS_PER_USER_MAX = 8;
const FOLLOWS_PER_USER_MIN = 10;
const FOLLOWS_PER_USER_MAX = 40;

/**
 * 기존 데모 데이터 삭제
 */
async function resetDemoData() {
  console.log("🗑️  기존 데모 데이터 삭제 중...");

  // 데모 유저 찾기 (clerk_id가 'demo_user_'로 시작하는 것들)
  const { data: demoUsers } = await supabase
    .from("users")
    .select("id")
    .like("clerk_id", "demo_user_%");

  if (demoUsers && demoUsers.length > 0) {
    const userIds = demoUsers.map((u) => u.id);

    // 관련 데이터 삭제 (CASCADE로 자동 삭제되지만 명시적으로)
    await supabase.from("follows").delete().in("follower_id", userIds);
    await supabase.from("follows").delete().in("following_id", userIds);
    await supabase.from("likes").delete().in("user_id", userIds);
    await supabase.from("comments").delete().in("user_id", userIds);

    // 게시물 삭제
    const { data: posts } = await supabase
      .from("posts")
      .select("id")
      .in("user_id", userIds);

    if (posts && posts.length > 0) {
      const postIds = posts.map((p) => p.id);
      await supabase.from("likes").delete().in("post_id", postIds);
      await supabase.from("comments").delete().in("post_id", postIds);
      await supabase.from("posts").delete().in("id", postIds);
    }

    // 유저 삭제
    await supabase.from("users").delete().in("id", userIds);
  }

  console.log("✅ 기존 데모 데이터 삭제 완료");
}

/**
 * 데모 유저 생성
 */
async function createDemoUsers(): Promise<DemoUser[]> {
  console.log(`👥 ${DEMO_USER_COUNT}명의 데모 유저 생성 중...`);

  const users: DemoUser[] = [];
  const usernames = new Set<string>(); // 중복 방지

  for (let i = 0; i < DEMO_USER_COUNT; i++) {
    // 진행률 표시 (5명마다 또는 마지막)
    if (i % 5 === 0 || i === DEMO_USER_COUNT - 1) {
      const percent = Math.round(((i + 1) / DEMO_USER_COUNT) * 100);
      console.log(`   진행 중... ${i + 1}/${DEMO_USER_COUNT}명 (${percent}%)`);
    }

    // 고유한 username 생성
    let username: string;
    do {
      username = faker.internet
        .username()
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, "");
      if (username.length < 3) {
        username = `user${faker.number.int({ min: 1000, max: 9999 })}`;
      }
    } while (usernames.has(username));
    usernames.add(username);

    // display_name 생성 (사람 이름 느낌)
    const displayName = faker.person.fullName();

    const user: DemoUser = {
      id: faker.string.uuid(),
      clerk_id: `demo_user_${i + 1}`,
      name: displayName,
      created_at: faker.date.past({ years: 1 }).toISOString(),
    };

    users.push(user);
  }

  // 배치로 삽입
  console.log(`   데이터베이스에 삽입 중...`);
  const { error } = await supabase.from("users").insert(users);

  if (error) {
    console.error("❌ 유저 생성 실패:", error);
    throw error;
  }

  console.log(`✅ ${users.length}명의 데모 유저 생성 완료`);
  return users;
}

/**
 * 데모 게시물 생성
 */
async function createDemoPosts(users: DemoUser[]): Promise<DemoPost[]> {
  console.log("📸 데모 게시물 생성 중...");

  const allPosts: DemoPost[] = [];
  let processedUsers = 0;

  for (const user of users) {
    const postCount = faker.number.int({
      min: POSTS_PER_USER_MIN,
      max: POSTS_PER_USER_MAX,
    });

    for (let i = 0; i < postCount; i++) {
      // 4:5 비율 이미지 (800x1000)
      const seed = faker.number.int({ min: 1, max: 10000 });
      const imageUrl = `https://picsum.photos/seed/${seed}/800/1000`;

      // 자연스러운 caption 생성
      const captionTemplates = [
        `${faker.lorem.sentence()}`,
        `${faker.lorem.sentence()} ${faker.lorem.sentence()}`,
        `${faker.lorem.sentence()} #${faker.lorem.word()}`,
        `${faker.lorem.sentence()} ✨`,
      ];
      const caption = faker.helpers.arrayElement(captionTemplates);

      const post: DemoPost = {
        id: faker.string.uuid(),
        user_id: user.id,
        image_url: imageUrl,
        caption: caption.length > 2200 ? caption.substring(0, 2200) : caption,
        created_at: faker.date
          .between({
            from: new Date(user.created_at),
            to: new Date(),
          })
          .toISOString(),
      };

      allPosts.push(post);
    }

    processedUsers++;
    // 진행률 표시 (10명마다 또는 마지막)
    if (processedUsers % 10 === 0 || processedUsers === users.length) {
      const percent = Math.round((processedUsers / users.length) * 100);
      console.log(
        `   진행 중... ${processedUsers}/${users.length}명 처리 완료 (${percent}%) - 게시물 ${allPosts.length}개 생성됨`,
      );
    }
  }

  // 배치로 삽입 (100개씩)
  console.log(`   데이터베이스에 삽입 중... (총 ${allPosts.length}개)`);
  const batchSize = 100;
  for (let i = 0; i < allPosts.length; i += batchSize) {
    const batch = allPosts.slice(i, i + batchSize);
    const { error } = await supabase.from("posts").insert(batch);

    if (error) {
      console.error("❌ 게시물 생성 실패:", error);
      throw error;
    }

    // 배치 삽입 진행률 표시
    const inserted = Math.min(i + batchSize, allPosts.length);
    const percent = Math.round((inserted / allPosts.length) * 100);
    if (i % 200 === 0 || inserted === allPosts.length) {
      console.log(
        `   삽입 진행 중... ${inserted}/${allPosts.length}개 (${percent}%)`,
      );
    }
  }

  console.log(`✅ ${allPosts.length}개의 데모 게시물 생성 완료`);
  return allPosts;
}

/**
 * 데모 팔로우 관계 생성
 */
async function createDemoFollows(users: DemoUser[]) {
  console.log("👥 데모 팔로우 관계 생성 중...");

  // 인기 유저 선정 (상위 20%가 더 많은 팔로워를 받도록)
  const popularUserCount = Math.floor(users.length * 0.2);
  const popularUsers = users.slice(0, popularUserCount);

  const follows: Array<{
    follower_id: string;
    following_id: string;
    created_at: string;
  }> = [];

  for (let userIndex = 0; userIndex < users.length; userIndex++) {
    const user = users[userIndex];

    // 진행률 표시 (5명마다 또는 마지막)
    if (userIndex % 5 === 0 || userIndex === users.length - 1) {
      const percent = Math.round(((userIndex + 1) / users.length) * 100);
      console.log(
        `   진행 중... ${userIndex + 1}/${
          users.length
        }명 처리 완료 (${percent}%)`,
      );
    }

    const followCount = faker.number.int({
      min: FOLLOWS_PER_USER_MIN,
      max: FOLLOWS_PER_USER_MAX,
    });

    // 팔로우할 유저 선택 (인기 유저에게 더 많이 팔로우)
    const candidates = [...users].filter((u) => u.id !== user.id);
    const selected: DemoUser[] = [];

    for (
      let i = 0;
      i < followCount && selected.length < candidates.length;
      i++
    ) {
      // 30% 확률로 인기 유저 선택
      const isPopular = Math.random() < 0.3 && popularUsers.length > 0;
      const pool = isPopular ? popularUsers : candidates;

      let target: DemoUser;
      do {
        target = faker.helpers.arrayElement(pool);
      } while (
        target.id === user.id ||
        selected.some((s) => s.id === target.id)
      );

      selected.push(target);

      follows.push({
        follower_id: user.id,
        following_id: target.id,
        created_at: faker.date
          .between({
            from: new Date(user.created_at),
            to: new Date(),
          })
          .toISOString(),
      });
    }
  }

  // 배치로 삽입
  console.log(`   데이터베이스에 삽입 중... (총 ${follows.length}개)`);
  const batchSize = 100;
  for (let i = 0; i < follows.length; i += batchSize) {
    const batch = follows.slice(i, i + batchSize);
    const { error } = await supabase.from("follows").insert(batch);

    if (error) {
      // UNIQUE 제약조건 위반은 무시 (이미 팔로우 중)
      if (!error.message.includes("duplicate")) {
        console.error("❌ 팔로우 관계 생성 실패:", error);
        throw error;
      }
    }

    // 배치 삽입 진행률 표시 (100개마다 또는 마지막)
    const inserted = Math.min(i + batchSize, follows.length);
    const percent = Math.round((inserted / follows.length) * 100);
    if (i % 100 === 0 || inserted === follows.length) {
      console.log(
        `   삽입 진행 중... ${inserted}/${follows.length}개 (${percent}%)`,
      );
    }
  }

  console.log(`✅ ${follows.length}개의 팔로우 관계 생성 완료`);
}

/**
 * 데모 좋아요 생성
 */
async function createDemoLikes(users: DemoUser[], posts: DemoPost[]) {
  console.log("❤️  데모 좋아요 생성 중...");

  // 인기 게시물 선정 (상위 30%가 더 많은 좋아요를 받도록)
  const popularPostCount = Math.floor(posts.length * 0.3);
  const popularPosts = posts.slice(0, popularPostCount);

  const likes: Array<{
    post_id: string;
    user_id: string;
    created_at: string;
  }> = [];

  // 각 게시물에 좋아요 추가
  for (let postIndex = 0; postIndex < posts.length; postIndex++) {
    const post = posts[postIndex];

    // 진행률 표시 (50개마다 또는 마지막)
    if (postIndex % 50 === 0 || postIndex === posts.length - 1) {
      const percent = Math.round(((postIndex + 1) / posts.length) * 100);
      console.log(
        `   진행 중... ${postIndex + 1}/${
          posts.length
        }개 게시물 처리 (${percent}%) - 좋아요 ${likes.length}개 생성됨`,
      );
    }

    // 인기 게시물은 더 많은 좋아요
    const isPopular = popularPosts.includes(post);
    const likeCount = isPopular
      ? faker.number.int({ min: 20, max: 150 })
      : faker.number.int({ min: 0, max: 50 });

    // 좋아요할 유저 선택 (본인 게시물 제외)
    const candidates = users.filter((u) => u.id !== post.user_id);
    const selected = faker.helpers.arrayElements(
      candidates,
      Math.min(likeCount, candidates.length),
    );

    for (const user of selected) {
      likes.push({
        post_id: post.id,
        user_id: user.id,
        created_at: faker.date
          .between({
            from: new Date(post.created_at),
            to: new Date(),
          })
          .toISOString(),
      });
    }
  }

  // 배치로 삽입
  console.log(`   데이터베이스에 삽입 중... (총 ${likes.length}개)`);
  const batchSize = 100;
  for (let i = 0; i < likes.length; i += batchSize) {
    const batch = likes.slice(i, i + batchSize);
    const { error } = await supabase.from("likes").insert(batch);

    if (error) {
      // UNIQUE 제약조건 위반은 무시
      if (!error.message.includes("duplicate")) {
        console.error("❌ 좋아요 생성 실패:", error);
        throw error;
      }
    }

    // 배치 삽입 진행률 표시 (500개마다 또는 마지막)
    const inserted = Math.min(i + batchSize, likes.length);
    const percent = Math.round((inserted / likes.length) * 100);
    if (i % 500 === 0 || inserted === likes.length) {
      console.log(
        `   삽입 진행 중... ${inserted}/${likes.length}개 (${percent}%)`,
      );
    }
  }

  console.log(`✅ ${likes.length}개의 좋아요 생성 완료`);
}

/**
 * 데모 댓글 생성
 */
async function createDemoComments(users: DemoUser[], posts: DemoPost[]) {
  console.log("💬 데모 댓글 생성 중...");

  // 인기 게시물 선정
  const popularPostCount = Math.floor(posts.length * 0.3);
  const popularPosts = posts.slice(0, popularPostCount);

  const comments: Array<{
    post_id: string;
    user_id: string;
    content: string;
    created_at: string;
  }> = [];

  // 각 게시물에 댓글 추가
  for (let postIndex = 0; postIndex < posts.length; postIndex++) {
    const post = posts[postIndex];

    // 진행률 표시 (50개마다 또는 마지막)
    if (postIndex % 50 === 0 || postIndex === posts.length - 1) {
      const percent = Math.round(((postIndex + 1) / posts.length) * 100);
      console.log(
        `   진행 중... ${postIndex + 1}/${
          posts.length
        }개 게시물 처리 (${percent}%) - 댓글 ${comments.length}개 생성됨`,
      );
    }

    // 인기 게시물은 더 많은 댓글
    const isPopular = popularPosts.includes(post);
    const commentCount = isPopular
      ? faker.number.int({ min: 5, max: 30 })
      : faker.number.int({ min: 0, max: 10 });

    // 댓글할 유저 선택 (본인 게시물 제외)
    const candidates = users.filter((u) => u.id !== post.user_id);
    const selected = faker.helpers.arrayElements(
      candidates,
      Math.min(commentCount, candidates.length),
    );

    for (const user of selected) {
      // 자연스러운 댓글 생성
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
        created_at: faker.date
          .between({
            from: new Date(post.created_at),
            to: new Date(),
          })
          .toISOString(),
      });
    }
  }

  // 일부 유저는 lurking (댓글 거의 안 달기)
  const lurkingUserCount = Math.floor(users.length * 0.2);
  const lurkingUsers = users.slice(-lurkingUserCount);
  const activeComments = comments.filter(
    (c) => !lurkingUsers.some((u) => u.id === c.user_id),
  );

  // 배치로 삽입
  console.log(`   데이터베이스에 삽입 중... (총 ${activeComments.length}개)`);
  const batchSize = 100;
  for (let i = 0; i < activeComments.length; i += batchSize) {
    const batch = activeComments.slice(i, i + batchSize);
    const { error } = await supabase.from("comments").insert(batch);

    if (error) {
      console.error("❌ 댓글 생성 실패:", error);
      throw error;
    }

    // 배치 삽입 진행률 표시 (200개마다 또는 마지막)
    const inserted = Math.min(i + batchSize, activeComments.length);
    const percent = Math.round((inserted / activeComments.length) * 100);
    if (i % 200 === 0 || inserted === activeComments.length) {
      console.log(
        `   삽입 진행 중... ${inserted}/${activeComments.length}개 (${percent}%)`,
      );
    }
  }

  console.log(`✅ ${activeComments.length}개의 댓글 생성 완료`);
}

/**
 * 메인 실행 함수
 */
async function main() {
  const shouldReset = process.argv.includes("--reset");

  try {
    console.log("🚀 데모 시드 데이터 생성 시작...\n");

    if (shouldReset) {
      await resetDemoData();
      console.log("");
    }

    // 1. 유저 생성
    const users = await createDemoUsers();
    console.log("");

    // 2. 게시물 생성
    const posts = await createDemoPosts(users);
    console.log("");

    // 3. 팔로우 관계 생성
    await createDemoFollows(users);
    console.log("");

    // 4. 좋아요 생성
    await createDemoLikes(users, posts);
    console.log("");

    // 5. 댓글 생성
    await createDemoComments(users, posts);
    console.log("");

    console.log("✅ 모든 데모 데이터 생성 완료!");
    console.log(`\n📊 생성된 데이터:`);
    console.log(`   - 유저: ${users.length}명`);
    console.log(`   - 게시물: ${posts.length}개`);
  } catch (error) {
    console.error("❌ 에러 발생:", error);
    process.exit(1);
  }
}

// 실행
main();
