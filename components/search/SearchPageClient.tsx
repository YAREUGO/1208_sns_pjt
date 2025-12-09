/**
 * @file components/search/SearchPageClient.tsx
 * @description 검색 페이지 클라이언트 컴포넌트
 *
 * 기능:
 * - 사용자 검색
 * - 게시물 검색
 * - 검색 결과 표시
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, User, Image as ImageIcon, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";

interface SearchUser {
  id: string;
  clerk_id: string;
  name: string;
  created_at: string;
}

interface SearchPost {
  id: string;
  user_id: string;
  image_url: string;
  caption: string | null;
  created_at: string;
  user: {
    id: string;
    clerk_id: string;
    name: string;
  };
}

export function SearchPageClient() {
  const [query, setQuery] = useState("");
  const [searchType, setSearchType] = useState<"all" | "users" | "posts">("all");
  const [users, setUsers] = useState<SearchUser[]>([]);
  const [posts, setPosts] = useState<SearchPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const performSearch = useCallback(async (searchQuery: string, type: string) => {
    if (!searchQuery.trim()) {
      setUsers([]);
      setPosts([]);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setHasSearched(true);

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&type=${type}`);
      const data = await response.json();

      if (data.error) {
        console.error("Search error:", data.error);
        return;
      }

      setUsers(data.users || []);
      setPosts(data.posts || []);
    } catch (error) {
      console.error("Error searching:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(query, searchType);
    }, 300); // 디바운스 300ms

    return () => clearTimeout(timer);
  }, [query, searchType, performSearch]);

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg-app)' }}>
      {/* 검색 헤더 */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b" style={{ borderColor: 'var(--color-border-subtle)' }}>
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="사용자나 게시물 검색..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 pr-4 py-6 text-base bg-background border-2"
              style={{
                borderColor: 'var(--color-border-strong)'
              }}
            />
          </div>

          {/* 검색 타입 탭 */}
          <div className="flex gap-2 mt-4">
            <Button
              variant={searchType === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSearchType("all")}
              className={cn(
                "rounded-full",
                searchType === "all" && "bg-primary text-primary-foreground"
              )}
            >
              전체
            </Button>
            <Button
              variant={searchType === "users" ? "default" : "outline"}
              size="sm"
              onClick={() => setSearchType("users")}
              className={cn(
                "rounded-full",
                searchType === "users" && "bg-primary text-primary-foreground"
              )}
            >
              사용자
            </Button>
            <Button
              variant={searchType === "posts" ? "default" : "outline"}
              size="sm"
              onClick={() => setSearchType("posts")}
              className={cn(
                "rounded-full",
                searchType === "posts" && "bg-primary text-primary-foreground"
              )}
            >
              게시물
            </Button>
          </div>
        </div>
      </div>

      {/* 검색 결과 */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : !hasSearched ? (
          <div className="text-center py-16">
            <Search className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">검색어를 입력하세요</p>
          </div>
        ) : query.trim() === "" ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">검색어를 입력하세요</p>
          </div>
        ) : (
          <>
            {/* 사용자 결과 */}
            {(searchType === "all" || searchType === "users") && users.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
                  사용자 ({users.length})
                </h2>
                <div className="space-y-2">
                  {users.map((user) => (
                    <Link
                      key={user.id}
                      href={`/profile/${user.clerk_id}`}
                      className="flex items-center gap-4 p-4 rounded-lg hover:bg-muted transition-colors"
                    >
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                          {user.name}
                        </p>
                      </div>
                      <User className="w-5 h-5 text-muted-foreground" />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* 게시물 결과 */}
            {(searchType === "all" || searchType === "posts") && posts.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
                  게시물 ({posts.length})
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {posts.map((post) => (
                    <Link
                      key={post.id}
                      href={`/profile/${post.user.clerk_id}`}
                      className="relative aspect-square group"
                    >
                      <Image
                        src={post.image_url}
                        alt={post.caption || "게시물"}
                        fill
                        className="object-cover rounded-lg"
                        sizes="(max-width: 768px) 50vw, 33vw"
                        unoptimized
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="flex items-center gap-4 text-white">
                          <div className="flex items-center gap-1">
                            <ImageIcon className="w-5 h-5" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* 결과 없음 */}
            {users.length === 0 && posts.length === 0 && query.trim() !== "" && (
              <div className="text-center py-16">
                <p className="text-muted-foreground">검색 결과가 없습니다</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

