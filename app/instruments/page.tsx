/**
 * @file instruments/page.tsx
 * @description Supabase 공식 Next.js 가이드 스타일의 예제 페이지
 * 
 * 이 페이지는 Supabase 공식 문서의 예제를 기반으로 작성되었습니다.
 * https://supabase.com/docs/guides/getting-started/quickstarts/nextjs
 * 
 * 사용 방법:
 * 1. Supabase Dashboard에서 'instruments' 테이블 생성
 * 2. 샘플 데이터 삽입
 * 3. RLS 정책 설정 (공개 읽기 권한)
 */

import { createClient } from "@/lib/supabase/server";
import { Suspense } from "react";

// 동적 렌더링 강제 (Supabase 클라이언트가 headers()를 사용하므로)
export const dynamic = "force-dynamic";

async function InstrumentsData() {
  const supabase = await createClient();
  const { data: instruments, error } = await supabase
    .from("instruments")
    .select();

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded">
        <p className="text-red-800 font-semibold">오류 발생</p>
        <p className="text-red-600 text-sm mt-1">{error.message}</p>
      </div>
    );
  }

  if (!instruments || instruments.length === 0) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
        <p className="text-yellow-800">데이터가 없습니다.</p>
        <p className="text-yellow-600 text-sm mt-1">
          Supabase Dashboard에서 &apos;instruments&apos; 테이블을 생성하고 샘플 데이터를 추가하세요.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">악기 목록</h2>
      <ul className="space-y-2">
        {instruments.map((instrument: any) => (
          <li
            key={instrument.id}
            className="p-3 bg-white border border-gray-200 rounded shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">{instrument.name}</span>
              <span className="text-sm text-gray-500">ID: {instrument.id}</span>
            </div>
          </li>
        ))}
      </ul>
      <details className="mt-4">
        <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
          원시 데이터 보기
        </summary>
        <pre className="mt-2 p-4 bg-gray-50 border border-gray-200 rounded text-xs overflow-auto">
          {JSON.stringify(instruments, null, 2)}
        </pre>
      </details>
    </div>
  );
}

export default function Instruments() {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Supabase 연결 테스트</h1>
      <p className="text-gray-600 mb-4">
        이 페이지는 Supabase 공식 Next.js 가이드의 예제를 기반으로 작성되었습니다.
      </p>
      <Suspense
        fallback={
          <div className="p-4 bg-blue-50 border border-blue-200 rounded">
            <p className="text-blue-800">데이터를 불러오는 중...</p>
          </div>
        }
      >
        <InstrumentsData />
      </Suspense>
    </div>
  );
}

