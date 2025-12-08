/**
 * @file components/post/CreatePostModal.tsx
 * @description 게시물 작성 모달 컴포넌트
 *
 * 기능:
 * - Dialog 컴포넌트 사용
 * - 이미지 미리보기 UI
 * - 텍스트 입력 필드 (최대 2,200자)
 * - 파일 선택 버튼
 * - 업로드 버튼
 */

"use client";

import { useState, useRef } from "react";
import { X, Upload, Image as ImageIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface CreatePostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreatePostModal({
  open,
  onOpenChange,
  onSuccess,
}: CreatePostModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 파일 크기 검증 (최대 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("파일 크기는 5MB 이하여야 합니다.");
      return;
    }

    // 이미지 파일 검증
    if (!file.type.startsWith("image/")) {
      alert("이미지 파일만 업로드할 수 있습니다.");
      return;
    }

    setSelectedFile(file);

    // 미리보기 생성
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert("이미지를 선택해주세요.");
      return;
    }

    if (caption.length > 2200) {
      alert("캡션은 최대 2,200자까지 입력할 수 있습니다.");
      return;
    }

    setUploading(true);

    try {
      // FormData 생성
      const formData = new FormData();
      formData.append("image", selectedFile);
      formData.append("caption", caption);

      const response = await fetch("/api/posts", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "게시물 업로드에 실패했습니다.");
      }

      // 성공 시 모달 닫기 및 초기화
      handleClose();
      onSuccess?.();
    } catch (error) {
      console.error("Error uploading post:", error);
      alert(error instanceof Error ? error.message : "게시물 업로드에 실패했습니다.");
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreview(null);
    setCaption("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0">
        <DialogHeader className="px-6 py-4 border-b border-instagram-border">
          <DialogTitle className="text-lg font-instagram-semibold text-instagram-text-primary">
            새 게시물 만들기
          </DialogTitle>
        </DialogHeader>

        <div className="p-6">
          {/* 이미지 선택 영역 */}
          {!preview ? (
            <div
              className={cn(
                "border-2 border-dashed border-instagram-border rounded-lg",
                "flex flex-col items-center justify-center p-12",
                "cursor-pointer hover:border-instagram-blue transition-colors",
                "bg-gray-50"
              )}
              onClick={() => fileInputRef.current?.click()}
            >
              <ImageIcon className="w-16 h-16 text-instagram-text-secondary mb-4" />
              <p className="text-instagram-text-primary font-instagram-semibold mb-2">
                사진을 여기에 끌어다 놓으세요
              </p>
              <p className="text-instagram-text-secondary text-sm mb-4">
                또는 클릭하여 선택하세요
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                <Upload className="w-4 h-4 mr-2" />
                파일 선택
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-4">
              {/* 이미지 미리보기 */}
              <div className="relative w-full aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={preview}
                  alt="미리보기"
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => {
                    setSelectedFile(null);
                    setPreview(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = "";
                    }
                  }}
                  className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors"
                  aria-label="이미지 제거"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* 캡션 입력 */}
              <div>
                <label className="block text-sm font-instagram-semibold text-instagram-text-primary mb-2">
                  캡션
                </label>
                <Textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="게시물에 대한 설명을 입력하세요..."
                  maxLength={2200}
                  rows={4}
                  className="resize-none"
                />
                <div className="text-right text-xs text-instagram-text-secondary mt-1">
                  {caption.length}/2,200
                </div>
              </div>

              {/* 업로드 버튼 */}
              <Button
                onClick={handleUpload}
                disabled={uploading}
                className="w-full"
              >
                {uploading ? "업로드 중..." : "게시물 업로드"}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

