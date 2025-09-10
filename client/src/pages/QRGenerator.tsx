// pages/QRGenerator.tsx
import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface QRData {
  productCode: string;
  url: string;
}

export const QRGeneratorPage = () => {
  const [inputText, setInputText] = useState('');
  const [qrList, setQrList] = useState<QRData[]>([]);

  const generateQRs = () => {
    if (!inputText.trim()) {
      alert('S/N을 입력해주세요.');
      return;
    }

    // 쉼표로 분리해서 여러 S/N 처리
    const productCodes = inputText
      .split(',')
      .map((code) => code.trim().toUpperCase())
      .filter((code) => code.length > 0);

    if (productCodes.length === 0) {
      alert('유효한 S/N을 입력해주세요.');
      return;
    }

    const newQRs: QRData[] = productCodes.map((code) => ({
      productCode: code,
      url: `https://ship.arneg.co.kr/?sn=${code}`,
    }));

    setQrList(newQRs);
  };

  const clearAll = () => {
    setQrList([]);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      generateQRs();
    }
  };

  return (
    <div className="space-y-6">
      {/* 📱 모바일 최적화된 헤더 */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-900 md:text-3xl dark:text-slate-100">QR 코드 생성</h1>
        <p className="mt-2 text-sm text-slate-600 md:text-base dark:text-slate-400">
          S/N을 입력하여 QR 코드를 생성하고 출력하세요
        </p>
      </div>

      {/* 📱 모바일 최적화된 입력 폼 */}
      <div className="rounded-xl bg-white p-4 shadow-lg md:p-6 dark:bg-slate-800">
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
              S/N 입력 <span className="text-slate-500">(여러 개는 쉼표로 구분)</span>
            </label>
            <input
              value={inputText}
              onChange={(e) => setInputText(e.target.value.toUpperCase())}
              onKeyDown={handleKeyDown}
              placeholder="예: AAQ6300490 또는 AAQ6300490,AAQ6300491,AAQ6300492"
              className="h-20 w-full resize-none rounded-lg border border-slate-300 px-4 py-3 font-mono text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 md:h-16 md:text-lg dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
              autoFocus
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={generateQRs}
              disabled={!inputText.trim()}
              className="flex-1 rounded-lg bg-indigo-600 px-4 py-3 font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              QR 생성
            </button>
          </div>
        </div>
      </div>

      {/* QR 리스트가 있을 때만 표시 */}
      {qrList.length > 0 && (
        <>
          {/* 📱 모바일 최적화된 컨트롤 */}
          <div className="flex items-center justify-between rounded-xl bg-white p-4 shadow-lg dark:bg-slate-800">
            <div className="text-sm md:text-base">
              <span className="font-semibold text-slate-900 dark:text-slate-100">생성된 QR: {qrList.length}개</span>
              <div className="text-xs text-slate-600 md:text-sm dark:text-slate-400">
                각 QR마다 별도 페이지로 인쇄됩니다
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handlePrint}
                className="cursor-pointer rounded-lg bg-green-600 px-4 py-2 font-semibold text-white hover:bg-green-700 md:px-6 md:py-3"
              >
                🖨️ 인쇄
              </button>
              {qrList.length > 0 && (
                <button
                  onClick={clearAll}
                  className="cursor-pointer rounded-lg bg-slate-500 px-4 py-3 font-semibold text-white hover:bg-slate-600"
                >
                  초기화
                </button>
              )}
            </div>
          </div>

          {/* 📱 모바일 최적화된 QR 미리보기 (화면용) */}
          <div className="rounded-xl bg-white p-4 shadow-lg md:p-6 dark:bg-slate-800 print:hidden">
            <h3 className="mb-4 text-lg font-semibold">미리보기</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {qrList.map((qr, index) => (
                <div key={index} className="rounded-lg border border-slate-300 p-4 text-center dark:border-slate-600">
                  <div className="flex justify-center">
                    <QRCodeSVG value={qr.url} size={120} level="H" includeMargin={true} />
                  </div>
                  <div className="mt-2 font-mono text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {qr.productCode}
                  </div>
                  <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">페이지 {index + 1}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* 🖨️ A4 출력용 (인쇄시에만 표시) - 각 QR마다 별도 페이지 */}
      <PrintPages qrList={qrList} />

      {/* 📱 모바일 최적화된 사용 안내 */}
      <div className="rounded-xl bg-blue-50 p-4 dark:bg-blue-900/20">
        <h4 className="font-semibold text-blue-800 dark:text-blue-300">💡 사용 안내</h4>
        <ul className="mt-2 space-y-1 text-sm text-blue-700 dark:text-blue-400">
          <li>• 각 S/N마다 별도 A4 페이지로 인쇄됩니다</li>
          <li>• QR 코드는 페이지 중앙에 크게 배치됩니다</li>
          <li>• 여러 S/N은 쉼표(,)로 구분해서 입력하세요</li>
          <li>• 스캔시 자동으로 S/N이 추출되어 등록됩니다</li>
        </ul>
      </div>

      {/* 🧪 테스트용 QR 코드 */}
      <div className="rounded-xl bg-green-50 p-4 dark:bg-green-900/20">
        <h4 className="font-semibold text-green-800 dark:text-green-300">🧪 스캔 테스트용</h4>
        <p className="mt-2 mb-4 text-sm text-green-700 dark:text-green-400">
          아래 QR 코드들로 스캔 기능을 테스트해보세요
        </p>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {/* Ship URL 타입 */}
          <div className="rounded-lg border border-green-200 p-3 text-center dark:border-green-700">
            <QRCodeSVG value="https://ship.arneg.co.kr/?sn=TEST001" size={80} level="H" includeMargin={true} />
            <div className="mt-2 font-mono text-xs text-green-800 dark:text-green-300">Ship URL</div>
            <div className="text-xs text-green-600 dark:text-green-400">→ TEST001</div>
          </div>

          {/* 순수 품번 타입 */}
          <div className="rounded-lg border border-green-200 p-3 text-center dark:border-green-700">
            <QRCodeSVG value="TEST002" size={80} level="H" includeMargin={true} />
            <div className="mt-2 font-mono text-xs text-green-800 dark:text-green-300">순수 S/N</div>
            <div className="text-xs text-green-600 dark:text-green-400">→ TEST002</div>
          </div>

          {/* 기타 타입 */}
          <div className="col-span-2 rounded-lg border border-green-200 p-3 text-center md:col-span-1 dark:border-green-700">
            <QRCodeSVG value="기타 QR 데이터" size={80} level="H" includeMargin={true} />
            <div className="mt-2 font-mono text-xs text-green-800 dark:text-green-300">기타 타입</div>
            <div className="text-xs text-green-600 dark:text-green-400">→ 원본</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 🖨️ A4 출력 전용 컴포넌트 - 각 QR마다 별도 페이지
const PrintPages = ({ qrList }: { qrList: QRData[] }) => {
  if (qrList.length === 0) return null;

  return (
    <div className="hidden print:flex print:flex-col">
      <style>{`
        @media print {
          /* 모든 요소 숨기기 */
          * {
            visibility: hidden;
          }
          
          /* 인쇄용 페이지만 표시 */
          .print-page, .print-page * {
            visibility: visible;
          }
          
          /* 전체 레이아웃 초기화 */
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            width: 100% !important;
            height: 100% !important;
          }
          
          /* A4 페이지 설정 */
          @page { 
            size: A4; 
            margin: 15mm;
          }
          
          /* 각 QR 페이지 */
          .print-page {
            position: absolute;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            display: flex !important;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            page-break-after: always;
            background: white;
          }
          
          .print-page:last-child {
            page-break-after: avoid;
          }
          
          .qr-container {
            text-align: center;
          }
          
          .product-code {
            font-family: 'Courier New', monospace;
            font-size: 24px;
            font-weight: bold;
            color: black !important;
            margin-top: 20px;
          }
          
          .site-info {
            font-size: 14px;
            color: #666 !important;
            margin-top: 8px;
          }
        }
      `}</style>

      {qrList.map((qr, index) => (
        <div
          key={index}
          className="print-page"
          style={{
            // 인라인 스타일로 강제 적용 (브라우저 호환성)
            position: 'relative',
            width: '100%',
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            pageBreakAfter: index === qrList.length - 1 ? 'avoid' : 'always',
            background: 'white',
          }}
        >
          <div className="qr-container">
            <QRCodeSVG value={qr.url} size={400} level="H" includeMargin={true} />
            <div
              className="product-code"
              style={{
                fontFamily: 'Courier New, monospace',
                fontSize: '24px',
                fontWeight: 'bold',
                color: 'black',
                marginTop: '20px',
              }}
            >
              {qr.productCode}
            </div>
            <div
              className="site-info"
              style={{
                fontSize: '14px',
                color: '#666',
                marginTop: '8px',
              }}
            >
              ship.arneg.co.kr
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
