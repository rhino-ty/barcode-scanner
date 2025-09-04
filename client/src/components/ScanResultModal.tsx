import { useState } from 'react';
import { useAuth } from '@/hooks/auth/useAuth';

interface ScanResult {
  barcode: string;
  timestamp: Date;
}

interface ScanResultModalProps {
  scanResult: ScanResult;
  onClose: () => void;
}

export const ScanResultModal = ({ scanResult, onClose }: ScanResultModalProps) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    productName: '',
    quantity: 1,
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      // 📤 서버로 데이터 전송 (5단계에서 구현)
      const submitData = {
        barcode: scanResult.barcode,
        scannedAt: scanResult.timestamp,
        productName: formData.productName,
        quantity: formData.quantity,
        notes: formData.notes,
        userId: user?.userId,
        username: user?.username,
        teamName: user?.teamName,
      };

      console.log('📤 출하등록 데이터:', submitData);

      // 더미 API 호출 시뮬레이션
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // 성공 처리
      alert('✅ 출하등록이 완료되었습니다!');
      onClose();
    } catch (error) {
      console.error('출하등록 실패:', error);
      alert('❌ 출하등록 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* 🌫️ 오버레이 */}
      <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose} />

      {/* 📝 모달 */}
      <div className="fixed inset-x-4 top-1/2 z-50 max-h-[90vh] -translate-y-1/2 overflow-y-auto rounded-xl bg-white shadow-xl md:inset-x-auto md:left-1/2 md:w-full md:max-w-md md:-translate-x-1/2 dark:bg-slate-800">
        {/* 🎯 헤더 */}
        <div className="border-b border-slate-200 p-6 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">📦 출하 등록</h2>
            <button onClick={onClose} className="rounded-lg p-1 hover:bg-slate-100 dark:hover:bg-slate-700">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* 📊 스캔 정보 */}
        <div className="border-b border-slate-200 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-800/50">
          <div className="text-center">
            <div className="font-mono text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {scanResult.barcode}
            </div>
            <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {scanResult.timestamp.toLocaleString('ko-KR')}
            </div>
          </div>
        </div>

        {/* 📝 폼 */}
        <div className="space-y-4 p-6">
          {/* 제품명 */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
              제품명 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="productName"
              value={formData.productName}
              onChange={handleInputChange}
              placeholder="제품명을 입력하세요"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
              required
            />
          </div>

          {/* 수량 */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">수량</label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleInputChange}
              min="1"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
            />
          </div>

          {/* 비고 */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">비고</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="추가 정보나 특이사항을 입력하세요"
              rows={3}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
            />
          </div>

          {/* 등록자 정보 */}
          <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-700/50">
            <div className="text-sm text-slate-600 dark:text-slate-400">등록자</div>
            <div className="font-medium text-slate-900 dark:text-slate-100">
              {user?.fullName || 'Guest'} ({user?.teamName || 'Test'})
            </div>
          </div>
        </div>

        {/* 🔽 하단 버튼 */}
        <div className="flex border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 py-4 text-slate-600 hover:bg-slate-50 disabled:opacity-50 dark:text-slate-400 dark:hover:bg-slate-700"
          >
            취소
          </button>
          <div className="w-px bg-slate-200 dark:bg-slate-700"></div>
          <button
            onClick={handleSubmit}
            disabled={!formData.productName.trim() || isSubmitting}
            className="flex-1 bg-indigo-600 py-4 text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                등록 중...
              </div>
            ) : (
              '📤 출하 등록'
            )}
          </button>
        </div>
      </div>
    </>
  );
};
