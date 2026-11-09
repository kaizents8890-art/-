import React, { useState, useRef } from 'react';
import { X, Upload, Check, RotateCcw, Image, Sparkles } from 'lucide-react';

interface LogoEditModalProps {
  isOpen: boolean;
  currentLogo?: string;
  onClose: () => void;
  onApplyLogo: (newLogoUrl: string | null) => void;
}

export const LogoEditModal: React.FC<LogoEditModalProps> = ({
  isOpen,
  currentLogo = '/assets/aistudio/mogege_brand_logo.png',
  onClose,
  onApplyLogo,
}) => {
  const [previewUrl, setPreviewUrl] = useState<string>(currentLogo || '/assets/aistudio/mogege_brand_logo.png');
  const [fileName, setFileName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setPreviewUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetToDefault = () => {
    setPreviewUrl('/assets/aistudio/mogege_new_logo.png');
    setFileName('공식 3D 모으개 캐릭터 로고 (기본값)');
  };

  const handleSave = () => {
    onApplyLogo(previewUrl);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-5 border border-stone-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-2xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900">모으개 브랜드 로고 수정</h3>
              <p className="text-[11px] text-stone-500">새 로고를 적용하면 웹사이트 전체에 일관되게 반영됩니다.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 cursor-pointer p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Preview Frame */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-stone-700 block">실시간 로고 미리보기 (원본 비율 유지)</span>
          <div className="bg-amber-50/40 rounded-2xl p-5 border border-amber-200/60 flex flex-col items-center justify-center space-y-3">
            <div className="w-24 h-24 rounded-2xl bg-white p-1.5 shadow-md border border-amber-100 flex items-center justify-center overflow-hidden">
              <img
                src={previewUrl}
                alt="로고 미리보기"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-white/80 rounded-full border border-stone-200 text-[11px] text-stone-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>헤더 및 메인 화면 적용 규격 (1:1 비율)</span>
            </div>
          </div>
        </div>

        {/* Upload Control */}
        <div className="space-y-3 text-xs">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 py-2.5 px-3 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>내 기기에서 새 이미지 선택</span>
            </button>
            <button
              type="button"
              onClick={handleResetToDefault}
              className="py-2.5 px-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl flex items-center justify-center gap-1 transition-colors cursor-pointer"
              title="첨부된 공식 3D 로고로 복원"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>기본 복원</span>
            </button>
          </div>

          {fileName && (
            <div className="text-[11px] text-stone-500 truncate bg-stone-50 p-2 rounded-lg border border-stone-200">
              선택된 파일: <strong className="text-stone-800">{fileName}</strong>
            </div>
          )}

          <p className="text-[11px] text-stone-400 leading-relaxed">
            * 투명 배경의 PNG 또는 고해상도 이미지를 권장하며, 이미지가 잘리거나 왜곡되지 않도록 원본 비율을 엄격히 보존합니다.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl cursor-pointer"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            <span>새 로고 적용하기</span>
          </button>
        </div>
      </div>
    </div>
  );
};
