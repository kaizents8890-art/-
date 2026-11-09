import React, { useState, useRef } from 'react';
import { X, Upload, RotateCcw, Check, Sparkles, Image as ImageIcon, AlertCircle } from 'lucide-react';

interface LogoChangeModalProps {
  isOpen: boolean;
  currentLogo: string;
  defaultLogo: string;
  onSaveLogo: (newLogoUrl: string) => void;
  onResetToDefault: () => void;
  onClose: () => void;
}

export const LogoChangeModal: React.FC<LogoChangeModalProps> = ({
  isOpen,
  currentLogo,
  defaultLogo,
  onSaveLogo,
  onResetToDefault,
  onClose,
}) => {
  const [previewUrl, setPreviewUrl] = useState<string>(currentLogo);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('이미지 파일(PNG, JPG, SVG, WebP 등)만 업로드할 수 있습니다.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('이미지 파일 크기는 최대 5MB까지 지원됩니다.');
      return;
    }

    setErrorMsg(null);
    setSelectedFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setPreviewUrl(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleApply = () => {
    onSaveLogo(previewUrl);
    onClose();
  };

  const handleReset = () => {
    setPreviewUrl(defaultLogo);
    setSelectedFileName(null);
    setErrorMsg(null);
    onResetToDefault();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-5 border border-stone-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900">모으개 브랜드 로고 설정</h3>
              <p className="text-[11px] text-stone-400">웹사이트 상단 내비게이션 및 홈 화면 로고를 변경합니다.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 p-1 rounded-lg hover:bg-stone-50 cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Preview Frame - 1:1 Aspect Ratio without Distortion */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-stone-700 block">로고 미리보기</label>
          <div className="bg-stone-50 border-2 border-dashed border-stone-200 rounded-2xl p-6 flex flex-col items-center justify-center gap-3">
            <div className="w-24 h-24 rounded-2xl bg-white shadow-sm border border-stone-100 p-2 flex items-center justify-center overflow-hidden">
              <img
                src={previewUrl}
                alt="로고 미리보기"
                className="w-full h-full object-contain"
              />
            </div>

            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-stone-200/80 shadow-2xs">
              <div className="w-6 h-6 rounded-md bg-amber-50 p-0.5 flex items-center justify-center overflow-hidden">
                <img src={previewUrl} alt="헤더 미리보기" className="w-full h-full object-contain" />
              </div>
              <span className="text-xs font-black text-stone-900 tracking-tight">모으개</span>
              <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-1 py-0.2 rounded">MOGEGAE</span>
            </div>

            <span className="text-[11px] text-stone-400">
              {selectedFileName ? `선택된 파일: ${selectedFileName}` : '원본 비율을 유지하여 왜곡 없이 깔끔하게 표시됩니다.'}
            </span>
          </div>
        </div>

        {/* Upload Controls */}
        <div className="space-y-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>새 로고 이미지 업로드</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="py-2.5 px-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              title="첨부된 기본 고화질 로고로 복원"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>기본 로고 복원</span>
            </button>
          </div>

          {errorMsg && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <p className="text-[11px] text-stone-400 leading-relaxed">
            * 투명 배경의 PNG 또는 고해상도 로고 이미지를 권장합니다. 기존 로고의 정체성과 형태를 보존하며 원본 비율이 유지됩니다.
          </p>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span>적용하기</span>
          </button>
        </div>
      </div>
    </div>
  );
};
