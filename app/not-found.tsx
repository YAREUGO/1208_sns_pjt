/**
 * @file app/not-found.tsx
 * @description 404 페이지
 *
 * 존재하지 않는 페이지에 접근할 때 표시되는 페이지
 */

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-instagram-background px-4">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-instagram-bold text-instagram-text-primary mb-4">
          404
        </h1>
        <h2 className="text-2xl font-instagram-semibold text-instagram-text-primary mb-2">
          페이지를 찾을 수 없습니다
        </h2>
        <p className="text-instagram-text-secondary mb-8">
          요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
        </p>
        <Link href="/">
          <Button className="bg-instagram-blue hover:bg-instagram-blue/90 text-white font-instagram-semibold">
            <Home className="w-4 h-4 mr-2" />
            홈으로 돌아가기
          </Button>
        </Link>
      </div>
    </div>
  );
}

