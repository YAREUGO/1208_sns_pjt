/**
 * @file lib/types.ts
 * @description Mini Instagram SNS 프로젝트의 TypeScript 타입 정의
 * 
 * 이 파일은 Supabase 데이터베이스 스키마와 일치하는 타입들을 정의합니다.
 * 모든 타입은 데이터베이스의 실제 컬럼 구조를 반영합니다.
 */

// ============================================
// 기본 엔티티 타입
// ============================================

/**
 * 사용자 정보
 * @see supabase/migrations/db.sql - users 테이블
 */
export interface User {
  id: string; // UUID
  clerk_id: string;
  name: string;
  created_at: string; // ISO timestamp
}

/**
 * 게시물 정보
 * @see supabase/migrations/db.sql - posts 테이블
 */
export interface Post {
  id: string; // UUID
  user_id: string; // UUID
  image_url: string; // Supabase Storage URL
  caption: string | null; // 최대 2,200자
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}

/**
 * 좋아요 정보
 * @see supabase/migrations/db.sql - likes 테이블
 */
export interface Like {
  id: string; // UUID
  post_id: string; // UUID
  user_id: string; // UUID
  created_at: string; // ISO timestamp
}

/**
 * 댓글 정보
 * @see supabase/migrations/db.sql - comments 테이블
 */
export interface Comment {
  id: string; // UUID
  post_id: string; // UUID
  user_id: string; // UUID
  content: string;
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}

/**
 * 팔로우 정보
 * @see supabase/migrations/db.sql - follows 테이블
 */
export interface Follow {
  id: string; // UUID
  follower_id: string; // UUID (팔로우하는 사람)
  following_id: string; // UUID (팔로우받는 사람)
  created_at: string; // ISO timestamp
}

// ============================================
// 확장 타입 (Views 기반)
// ============================================

/**
 * 게시물 통계 포함 타입
 * @see supabase/migrations/db.sql - post_stats 뷰
 */
export interface PostWithStats extends Post {
  likes_count: number;
  comments_count: number;
}

/**
 * 사용자 통계 포함 타입
 * @see supabase/migrations/db.sql - user_stats 뷰
 */
export interface UserWithStats extends User {
  posts_count: number;
  followers_count: number;
  following_count: number;
}

// ============================================
// 조인 타입 (관계 데이터 포함)
// ============================================

/**
 * 게시물 + 사용자 정보 + 통계
 * API 응답에서 자주 사용되는 타입
 */
export interface PostWithUser extends PostWithStats {
  user: User;
}

/**
 * 댓글 + 사용자 정보
 * API 응답에서 자주 사용되는 타입
 */
export interface CommentWithUser extends Comment {
  user: User;
}

// ============================================
// 유틸리티 타입
// ============================================

/**
 * 게시물 목록 조회 시 사용되는 타입
 * 페이지네이션 정보 포함
 */
export interface PostsResponse {
  posts: PostWithUser[];
  hasMore: boolean;
  nextOffset?: number;
}

/**
 * 댓글 목록 조회 시 사용되는 타입
 */
export interface CommentsResponse {
  comments: CommentWithUser[];
  total: number;
}

