import React, { useState } from 'react';
import {
  X,
  Radio,
  BatteryCharging,
  CheckCircle2,
  AlertCircle,
  Bluetooth,
  RefreshCw,
  ShoppingBag,
  Unlink,
  Link2,
  ShieldCheck,
  Smartphone,
  ChevronRight,
  Info
} from 'lucide-react';
import { UserProfile } from '../types';

interface GpsCollarModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onUpdateCollarStatus: (connected: boolean, deviceId?: string, battery?: number, model?: string) => void;
  onNavigateToShopCollar?: () => void;
}

export const GpsCollarModal: React.FC<GpsCollarModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateCollarStatus,
  onNavigateToShopCollar,
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [discoveredDevices, setDiscoveredDevices] = useState<
    Array<{ id: string; name: string; signal: string; battery: number }>
  >([]);
  const [serialInput, setSerialInput] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const isConnected = !!user.gpsCollarConnected;

  // Simulate Bluetooth device scan
  const handleStartScan = () => {
    setIsScanning(true);
    setDiscoveredDevices([]);
    setErrorMsg(null);

    setTimeout(() => {
      setDiscoveredDevices([
        {
          id: 'MOGE-GPS-9482',
          name: '모으개 스마트 안심 GPS 목걸이',
          signal: '-48 dBm (우수)',
          battery: 94,
        },
        {
          id: 'MOGE-GPS-3105',
          name: '모으개 GPS 목걸이 (서브)',
          signal: '-72 dBm (양호)',
          battery: 78,
        },
      ]);
      setIsScanning(false);
    }, 1500);
  };

  // Connect specific device
  const handleConnectDevice = (deviceId: string, battery: number) => {
    onUpdateCollarStatus(
      true,
      deviceId,
      battery,
      '모으개 스마트 안심 GPS 산책 목걸이 (공식 인증 기기)'
    );
    onClose();
  };

  // Manual serial number registration
  const handleRegisterSerial = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = serialInput.trim().toUpperCase();
    if (!trimmed) {
      setErrorMsg('목걸이 후면의 시리얼 번호(예: MOGE-GPS-9482)를 입력해 주세요.');
      return;
    }
    onUpdateCollarStatus(
      true,
      trimmed.startsWith('MOGE-') ? trimmed : `MOGE-${trimmed}`,
      95,
      '모으개 스마트 안심 GPS 산책 목걸이 (수동 등록)'
    );
    setSerialInput('');
    setErrorMsg(null);
    onClose();
  };

  // Disconnect collar
  const handleDisconnect = () => {
    onUpdateCollarStatus(false, undefined, undefined, undefined);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/70 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-linear-to-r from-amber-50 to-orange-50">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center shadow-xs border border-amber-200">
              <img
                src="/assets/brand/gps_collar_photo.png"
                alt="모으개 GPS 목걸이"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h3 className="text-base font-black text-stone-900 tracking-tight">
                모으개 안심 GPS 산책 목걸이 관리
              </h3>
              <p className="text-xs text-stone-500">
                실제 동행 산책 인증 & 포인트 적립 필수 디바이스
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-white/80 flex items-center justify-center text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Transparent prototype disclaimer */}
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-start gap-2.5 text-xs text-amber-900 leading-relaxed">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">투명한 프로토타입 연동 안내</p>
              <p className="text-amber-800/90 mt-0.5">
                모으개는 부정 적립(차량 탑승, 미동행 등) 방지를 위해 <strong>공식 GPS 목걸이 연동 상태</strong>에서만 산책 미션 시작 및 포인트 적립을 허용합니다. 아래 테스트용 블루투스 페어링 검색을 통해 즉시 가상 기기를 연동해 보실 수 있습니다.
              </p>
            </div>
          </div>

          {/* Current Connection Status Box */}
          <div
            className={`p-4 rounded-2xl border transition-all ${
              isConnected
                ? 'bg-emerald-50/60 border-emerald-300'
                : 'bg-rose-50/60 border-rose-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    isConnected
                      ? 'bg-emerald-500 text-white shadow-xs'
                      : 'bg-rose-400 text-white shadow-xs'
                  }`}
                >
                  {isConnected ? (
                    <ShieldCheck className="w-6 h-6" />
                  ) : (
                    <AlertCircle className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-black px-2 py-0.5 rounded-md ${
                        isConnected
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {isConnected ? '● GPS 목걸이 정상 연결됨' : '○ GPS 목걸이 미연결'}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-stone-900 mt-1">
                    {isConnected
                      ? user.gpsCollarDeviceId || 'MOGE-GPS-9482'
                      : '현재 연동된 GPS 기기가 없습니다'}
                  </h4>
                  <p className="text-xs text-stone-500">
                    {isConnected
                      ? `연결된 반려견: ${user.petName} (${user.petBreed})`
                      : '목걸이를 연결해야 산책 포인트 적립이 가능합니다'}
                  </p>
                </div>
              </div>

              {/* Status details or action */}
              {isConnected && (
                <div className="text-right">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-emerald-200 text-xs font-bold text-emerald-700">
                    <BatteryCharging className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{user.gpsCollarBattery ?? 94}%</span>
                  </div>
                  <button
                    onClick={handleDisconnect}
                    className="block mt-2 text-xs text-stone-400 hover:text-rose-600 underline font-medium cursor-pointer"
                  >
                    연결 해제
                  </button>
                </div>
              )}
            </div>

            {/* Additional details if connected */}
            {isConnected && (
              <div className="mt-3 pt-3 border-t border-emerald-200/60 grid grid-cols-2 gap-2 text-[11px] text-stone-600">
                <div>
                  <span className="text-stone-400">모델명:</span>{' '}
                  <span className="font-semibold text-stone-800">{user.gpsCollarModel || '스마트 안심 목걸이 Gen 2'}</span>
                </div>
                <div>
                  <span className="text-stone-400">신호 감도:</span>{' '}
                  <span className="font-semibold text-emerald-700">최상 (GPS + BLE 5.3)</span>
                </div>
              </div>
            )}
          </div>

          {/* If NOT connected, show pairing options */}
          {!isConnected && (
            <div className="space-y-4">
              {/* Method 1: Bluetooth Scan */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Bluetooth className="w-4 h-4 text-sky-600" />
                    <span className="text-xs font-bold text-stone-800">
                      방법 1. 주변 블루투스 기기 검색 (추천)
                    </span>
                  </div>
                  <button
                    onClick={handleStartScan}
                    disabled={isScanning}
                    className="px-3 py-1.5 rounded-xl bg-white border border-stone-300 hover:border-amber-400 hover:bg-amber-50 text-xs font-bold text-stone-700 flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin text-amber-500' : ''}`} />
                    <span>{isScanning ? '검색 중...' : '기기 검색'}</span>
                  </button>
                </div>

                {/* Discovered devices list */}
                {discoveredDevices.length > 0 ? (
                  <div className="space-y-2 mt-2">
                    {discoveredDevices.map((dev) => (
                      <div
                        key={dev.id}
                        className="p-3 rounded-xl bg-white border border-stone-200 hover:border-amber-400 flex items-center justify-between transition-colors"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-stone-900">{dev.name}</span>
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                              {dev.id}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-[11px] text-stone-500 mt-0.5">
                            <span>신호: {dev.signal}</span>
                            <span>배터리: {dev.battery}%</span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleConnectDevice(dev.id, dev.battery)}
                          className="px-3 py-1.5 rounded-xl bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold shadow-xs cursor-pointer"
                        >
                          페어링 연결
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-3 text-xs text-stone-400">
                    {isScanning
                      ? '주변 모으개 안심 GPS 목걸이를 탐색하고 있습니다...'
                      : '목걸이 전원을 켜고 [기기 검색] 버튼을 눌러주세요.'}
                  </div>
                )}
              </div>

              {/* Method 2: Manual Serial Number Input */}
              <form onSubmit={handleRegisterSerial} className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
                <div className="flex items-center gap-2 mb-2">
                  <Smartphone className="w-4 h-4 text-amber-600" />
                  <span className="text-xs font-bold text-stone-800">
                    방법 2. 목걸이 시리얼 번호 직접 등록
                  </span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={serialInput}
                    onChange={(e) => setSerialInput(e.target.value)}
                    placeholder="예: MOGE-GPS-9482"
                    className="flex-1 px-3 py-2 bg-white rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-hidden focus:border-amber-500 uppercase"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold cursor-pointer shrink-0"
                  >
                    등록
                  </button>
                </div>
                {errorMsg && (
                  <p className="text-xs text-rose-600 mt-1.5">{errorMsg}</p>
                )}
              </form>

              {/* Notice to purchase collar in Shop */}
              <div className="p-4 rounded-2xl bg-stone-900 text-white flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-stone-800 p-1 shrink-0 flex items-center justify-center border border-stone-700 overflow-hidden">
                    <img
                      src="/assets/brand/gps_collar_photo.png"
                      alt="모으개 GPS 목걸이"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <span className="text-xs font-black text-amber-300">
                      아직 GPS 목걸이가 없으신가요?
                    </span>
                    <p className="text-xs text-stone-300 mt-0.5">
                      모으개 SHOP에서 정가 대비 30% 할인 및 2,000P 지원
                    </p>
                  </div>
                </div>
                {onNavigateToShopCollar && (
                  <button
                    onClick={() => {
                      onClose();
                      onNavigateToShopCollar();
                    }}
                    className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shrink-0 flex items-center gap-1 cursor-pointer"
                  >
                    <span>SHOP 보러가기</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-stone-100 bg-stone-50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-bold transition-colors cursor-pointer"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
