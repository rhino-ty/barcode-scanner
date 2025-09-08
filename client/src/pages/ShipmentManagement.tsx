import { useState } from 'react';

// B_ITEM 테이블 기준 타입 정의
interface ItemData {
  id: string;
  itemCd: string; // S/N (ITEM_CD)
  itemNm: string; // 모델코드 (ITEM_NM)
  spec: string; // PW Code (SPEC)
  drawNo: string; // 수주번호 (DRAW_NO)
  note: string; // 비고
  registeredDate: string; // 등록일자
  containerCode?: string; // 컨테이너 코드
  sealNo?: string; // Seal No
}

// 더미 데이터
const dummyItems: ItemData[] = [
  {
    id: '1',
    itemCd: 'AAQ5280478',
    itemNm: 'LB0DCB2531SF2-AU32X6A4-19',
    spec: '',
    drawNo: '',
    note: '-',
    registeredDate: '2025-09-08',
    containerCode: 'CNT001',
    sealNo: 'SEAL001',
  },
  {
    id: '2',
    itemCd: 'AAQ5280479',
    itemNm: 'LB0B3731PR2-AU32X64-17',
    spec: 'PW 15350',
    drawNo: 'SN202505815001',
    note: '정상',
    registeredDate: '2025-09-08',
    containerCode: 'CNT001',
    sealNo: 'SEAL001',
  },
  {
    id: '3',
    itemCd: 'AAQ5280480',
    itemNm: 'LB0B3731PR2-AU32X64-17',
    spec: 'PW 15359',
    drawNo: 'SN202505815002',
    note: '정상',
    registeredDate: '2025-09-08',
    containerCode: 'CNT002',
    sealNo: 'SEAL002',
  },
  {
    id: '4',
    itemCd: 'AAQ9010001',
    itemNm: 'LB0B3731PR2-AU32X64-19',
    spec: 'PW 15351',
    drawNo: 'SN202505815002',
    note: '검수완료',
    registeredDate: '2025-09-09',
    containerCode: 'CNT002',
    sealNo: 'SEAL002',
  },
  {
    id: '5',
    itemCd: 'AAQ9020029',
    itemNm: 'LB0DCB2531SF2-AU32X6A4-19',
    spec: 'PW 16134',
    drawNo: 'SN202505812014',
    note: '정상',
    registeredDate: '2025-09-09',
    containerCode: 'CNT003',
    sealNo: 'SEAL003',
  },
  {
    id: '6',
    itemCd: 'AAQ9020030',
    itemNm: 'LB0DCB2531SF2-AU32X6A4-19',
    spec: 'PW 16132',
    drawNo: 'SN202505812014',
    note: '정상',
    registeredDate: '2025-09-09',
    containerCode: 'CNT003',
    sealNo: 'SEAL003',
  },
  {
    id: '7',
    itemCd: 'AAQ9020031',
    itemNm: 'LB0DCB2531SF2-AU32X6A4-19',
    spec: 'PW 16133',
    drawNo: 'SN202505812014',
    note: '정상',
    registeredDate: '2025-09-10',
    containerCode: 'CNT004',
    sealNo: 'SEAL004',
  },
  {
    id: '8',
    itemCd: 'AAQ9020032',
    itemNm: 'LB0DCB1631SF2-AU32X6A4-17',
    spec: 'PW 16418',
    drawNo: 'SN202505814007',
    note: '검수완료',
    registeredDate: '2025-09-10',
    containerCode: 'CNT004',
    sealNo: 'SEAL004',
  },
];

export const ShipmentManagementPage = () => {
  const [searchFilters, setSearchFilters] = useState({
    date: '',
    sealNo: '',
    containerCode: '',
    orderNo: '',
  });
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [selectedItem, setSelectedItem] = useState<ItemData | null>(null);

  // 검색 필터링(임시)
  const filteredItems = dummyItems.filter((item) => {
    const matchesDate = !searchFilters.date || item.registeredDate === searchFilters.date;
    const matchesSeal =
      !searchFilters.sealNo || item.sealNo?.toLowerCase().includes(searchFilters.sealNo.toLowerCase());
    const matchesContainer =
      !searchFilters.containerCode ||
      item.containerCode?.toLowerCase().includes(searchFilters.containerCode.toLowerCase());
    const matchesOrder =
      !searchFilters.orderNo || item.drawNo?.toLowerCase().includes(searchFilters.orderNo.toLowerCase());

    return matchesDate && matchesSeal && matchesContainer && matchesOrder;
  });

  // 체크박스 선택 처리
  const handleSelectItem = (id: string) => {
    setSelectedItems((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  // 전체 선택/해제
  const handleSelectAll = () => {
    if (selectedItems.length === filteredItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredItems.map((item) => item.id));
    }
  };

  // 조회 버튼 핸들러
  const handleSearch = () => {
    // API 호출 로직
    console.log('검색 조건:', searchFilters);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-center text-lg font-semibold text-slate-900 dark:text-slate-100">
        임시로 만들어 놨습니다. 추후 세부 요구사항을 정의하고 반영할 예정입니다.
      </h1>

      {/* 검색 영역 */}
      <div className="rounded-lg bg-white p-4 shadow-sm md:p-6 dark:bg-slate-800">
        <div className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">조회조건</div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* 일자 */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">일자</label>
            <input
              type="date"
              value={searchFilters.date}
              onChange={(e) => setSearchFilters((prev) => ({ ...prev, date: e.target.value }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-700"
            />
          </div>

          {/* Seal No */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Seal No</label>
            <input
              type="text"
              placeholder="Seal No"
              value={searchFilters.sealNo}
              onChange={(e) => setSearchFilters((prev) => ({ ...prev, sealNo: e.target.value }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-700"
            />
          </div>

          {/* 컨테이너 코드 */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">컨테이너 코드</label>
            <input
              type="text"
              placeholder="컨테이너 코드"
              value={searchFilters.containerCode}
              onChange={(e) => setSearchFilters((prev) => ({ ...prev, containerCode: e.target.value }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-700"
            />
          </div>

          {/* 수주 번호 */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">수주 번호</label>
            <input
              type="text"
              placeholder="수주 번호"
              value={searchFilters.orderNo}
              onChange={(e) => setSearchFilters((prev) => ({ ...prev, orderNo: e.target.value }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-700"
            />
          </div>
        </div>

        {/* 조회 버튼 */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleSearch}
            className="rounded-lg bg-indigo-600 px-6 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            조회
          </button>
        </div>
      </div>

      {/* 결과 영역 */}
      <div className="rounded-lg bg-white shadow-sm dark:bg-slate-800">
        {/* 결과 헤더 */}
        <div className="border-b border-slate-200 p-4 dark:border-slate-700">
          <div className="flex flex-col space-y-3 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              검색결과 ({filteredItems.length}건)
            </div>
            <div className="flex space-x-2">
              <button
                disabled={selectedItems.length === 0}
                className="flex-1 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:bg-gray-400 md:flex-none"
              >
                출하등록 ({selectedItems.length})
              </button>
            </div>
          </div>
        </div>

        {/* 데스크톱 테이블 (≥768px) */}
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-700">
              <tr>
                <th className="p-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedItems.length === filteredItems.length && filteredItems.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-slate-300"
                  />
                </th>
                <th className="p-3 text-left font-medium text-slate-900 dark:text-slate-100">S/N</th>
                <th className="p-3 text-left font-medium text-slate-900 dark:text-slate-100">모델코드</th>
                <th className="p-3 text-left font-medium text-slate-900 dark:text-slate-100">PW Code</th>
                <th className="p-3 text-left font-medium text-slate-900 dark:text-slate-100">수주번호</th>
                <th className="p-3 text-left font-medium text-slate-900 dark:text-slate-100">비고</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.id)}
                      onChange={() => handleSelectItem(item.id)}
                      className="rounded border-slate-300"
                    />
                  </td>
                  <td className="p-3 font-mono text-slate-900 dark:text-slate-100">{item.itemCd}</td>
                  <td className="p-3 text-slate-600 dark:text-slate-400">{item.itemNm}</td>
                  <td className="p-3 text-slate-600 dark:text-slate-400">{item.spec || '-'}</td>
                  <td className="p-3 font-mono text-slate-600 dark:text-slate-400">{item.drawNo || '-'}</td>
                  <td className="p-3 text-slate-600 dark:text-slate-400">{item.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 모바일 카드 리스트 (<768px) */}
        <div className="md:hidden">
          {filteredItems.map((item) => (
            <div key={item.id} className="border-b border-slate-200 p-4 dark:border-slate-700">
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={selectedItems.includes(item.id)}
                  onChange={() => handleSelectItem(item.id)}
                  className="mt-1 rounded border-slate-300"
                />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="font-mono font-semibold text-slate-900 dark:text-slate-100">{item.itemCd}</div>
                    <button
                      onClick={() => setSelectedItem(item)}
                      className="text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400"
                    >
                      상세
                    </button>
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">{item.itemNm}</div>
                  {item.spec && <div className="text-sm text-slate-500 dark:text-slate-400">PW: {item.spec}</div>}
                  {item.drawNo && (
                    <div className="font-mono text-sm text-slate-500 dark:text-slate-400">수주: {item.drawNo}</div>
                  )}
                  <div className="text-sm text-slate-500 dark:text-slate-400">비고: {item.note}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 데이터 없을 때 */}
        {filteredItems.length === 0 && (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400">조회된 결과가 없습니다.</div>
        )}
      </div>

      {/* 상세 모달 */}
      {selectedItem && (
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg bg-white dark:bg-slate-800">
            <div className="sticky top-0 border-b border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">상품정보 상세</h3>
                <button onClick={() => setSelectedItem(null)} className="text-xl text-slate-400 hover:text-slate-600">
                  ✕
                </button>
              </div>
            </div>

            <div className="space-y-1 p-4">
              <div className="grid grid-cols-3 gap-2 border-b border-slate-200 py-2 dark:border-slate-700">
                <div className="bg-yellow-200 px-2 py-1 text-xs font-medium text-slate-900">S/N</div>
                <div className="col-span-2 px-2 py-1 font-mono text-sm text-slate-700 dark:text-slate-300">
                  {selectedItem.itemCd}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 border-b border-slate-200 py-2 dark:border-slate-700">
                <div className="bg-yellow-200 px-2 py-1 text-xs font-medium text-slate-900">모델코드</div>
                <div className="col-span-2 px-2 py-1 text-sm text-slate-700 dark:text-slate-300">
                  {selectedItem.itemNm}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 border-b border-slate-200 py-2 dark:border-slate-700">
                <div className="bg-yellow-200 px-2 py-1 text-xs font-medium text-slate-900">PW Code</div>
                <div className="col-span-2 px-2 py-1 text-sm text-slate-700 dark:text-slate-300">
                  {selectedItem.spec || '-'}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 border-b border-slate-200 py-2 dark:border-slate-700">
                <div className="bg-yellow-200 px-2 py-1 text-xs font-medium text-slate-900">수주번호</div>
                <div className="col-span-2 px-2 py-1 font-mono text-sm text-slate-700 dark:text-slate-300">
                  {selectedItem.drawNo || '-'}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 border-b border-slate-200 py-2 dark:border-slate-700">
                <div className="bg-yellow-200 px-2 py-1 text-xs font-medium text-slate-900">컨테이너코드</div>
                <div className="col-span-2 px-2 py-1 text-sm text-slate-700 dark:text-slate-300">
                  {selectedItem.containerCode || '-'}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 border-b border-slate-200 py-2 dark:border-slate-700">
                <div className="bg-yellow-200 px-2 py-1 text-xs font-medium text-slate-900">Seal No</div>
                <div className="col-span-2 px-2 py-1 text-sm text-slate-700 dark:text-slate-300">
                  {selectedItem.sealNo || '-'}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 py-2">
                <div className="bg-yellow-200 px-2 py-1 text-xs font-medium text-slate-900">비고</div>
                <div className="col-span-2 px-2 py-1 text-sm text-slate-700 dark:text-slate-300">
                  {selectedItem.note}
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 border-t border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setSelectedItem(null)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                >
                  닫기
                </button>
                <button className="rounded-lg bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700">
                  출하등록
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
