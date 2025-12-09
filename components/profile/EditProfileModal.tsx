/**
 * @file components/profile/EditProfileModal.tsx
 * @description 프로필 편집 모달 컴포넌트
 *
 * 기능:
 * - 사용자 이름 편집
 * - 프로필 이미지 업로드
 */

"use client";

import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Camera, X } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";

interface EditProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentName: string;
  currentProfileImage?: string | null;
  onSuccess?: () => void;
}

export function EditProfileModal({
  open,
  onOpenChange,
  currentName,
  currentProfileImage,
  onSuccess,
}: EditProfileModalProps) {
  const [name, setName] = useState(currentName);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(currentProfileImage || null);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user: clerkUser } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setName(currentName);
      setPreview(currentProfileImage || null);
      setSelectedFile(null);
      setError(null);
    }
  }, [open, currentName, currentProfileImage]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 파일 크기 검증 (최대 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("파일 크기는 5MB 이하여야 합니다.");
      return;
    }

    // 이미지 파일 검증
    if (!file.type.startsWith("image/")) {
      setError("이미지 파일만 업로드할 수 있습니다.");
      return;
    }

    setSelectedFile(file);
    setError(null);

    // 미리보기 생성
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setError("이름을 입력해주세요.");
      return;
    }

    if (!clerkUser?.id) {
      setError("로그인이 필요합니다.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // 1. 프로필 이미지 업로드 (선택된 파일이 있는 경우)
      if (selectedFile) {
        setUploadingImage(true);
        const formData = new FormData();
        formData.append("image", selectedFile);

        const uploadResponse = await fetch(`/api/users/${clerkUser.id}/upload-image`, {
          method: "POST",
          body: formData,
        });

        const uploadData = await uploadResponse.json();

        if (!uploadResponse.ok) {
          throw new Error(uploadData.error || "프로필 이미지 업로드에 실패했습니다.");
        }

        // 이미지 URL은 서버에서 자동으로 업데이트됨
        setUploadingImage(false);
      }

      // 2. 이름 업데이트 (변경된 경우)
      if (name.trim() !== currentName) {
        const response = await fetch(`/api/users/${clerkUser.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: name.trim(),
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "프로필 업데이트에 실패했습니다.");
        }
      }

      onSuccess?.();
      onOpenChange(false);
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err instanceof Error ? err.message : "프로필 업데이트에 실패했습니다.");
      setUploadingImage(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>프로필 편집</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* 프로필 이미지 업로드 */}
          <div className="space-y-2">
            <Label>프로필 이미지</Label>
            <div className="flex items-center gap-4">
              <div className="relative">
                {preview ? (
                  <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-border">
                    <Image
                      src={preview}
                      alt="프로필 미리보기"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-0 right-0 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90"
                      disabled={saving || uploadingImage}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center border-2 border-border">
                    <span className="text-white font-bold text-2xl">
                      {name.charAt(0).toUpperCase() || "?"}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={saving || uploadingImage}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={saving || uploadingImage}
                  className="w-full md:w-auto"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  {preview ? "이미지 변경" : "이미지 업로드"}
                </Button>
              </div>
            </div>
          </div>

          {/* 이름 입력 */}
          <div className="space-y-2">
            <Label htmlFor="name">이름</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="이름을 입력하세요"
              maxLength={50}
              disabled={saving || uploadingImage}
              className="text-foreground bg-background"
            />
            <p className="text-xs text-muted-foreground">
              {name.length}/50
            </p>
          </div>

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            취소
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || uploadingImage || !name.trim() || (name.trim() === currentName && !selectedFile)}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {(saving || uploadingImage) ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {uploadingImage ? "업로드 중..." : "저장 중..."}
              </>
            ) : (
              "저장"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

