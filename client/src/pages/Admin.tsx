import { useState } from 'react';
import { useAuth } from '@/hooks/auth/useAuth';

export const AdminPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'login-logs' | 'scan-logs' | 'users'>('overview');

  // 관리자 권한 체크
  if (user?.userType !== 'admin') {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className="text-center">
          <div className="mb-4 text-6xl">🚫</div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">접근 권한이 없습니다</h2>
          <p className="mt-2 text-slate-600 dark:text-slate-400">관리자만 접근할 수 있는 페이지입니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">⚙️ 관리자 페이지</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">시스템 관리 및 로그 모니터링</p>
      </div>

      {/* 탭 네비게이션 */}
      <div className="flex overflow-x-auto border-b border-slate-200 dark:border-slate-700">
        <TabButton
          active={activeTab === 'overview'}
          onClick={() => setActiveTab('overview')}
          icon="📊"
          label="대시보드"
        />
        <TabButton
          active={activeTab === 'login-logs'}
          onClick={() => setActiveTab('login-logs')}
          icon="🔐"
          label="로그인 로그"
        />
        <TabButton
          active={activeTab === 'scan-logs'}
          onClick={() => setActiveTab('scan-logs')}
          icon="📷"
          label="스캔 로그"
        />
        <TabButton active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon="👥" label="사용자 관리" />
      </div>

      {/* 탭 컨텐츠 */}
      <div className="rounded-xl bg-white p-6 shadow-lg dark:bg-slate-800">
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'login-logs' && <LoginLogsTab />}
        {activeTab === 'scan-logs' && <ScanLogsTab />}
        {activeTab === 'users' && <UsersTab />}
      </div>
    </div>
  );
};

// 탭 버튼 컴포넌트
interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: string;
  label: string;
}

const TabButton = ({ active, onClick, icon, label }: TabButtonProps) => (
  <button
    onClick={onClick}
    className={`flex min-w-0 flex-1 items-center justify-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors sm:flex-none sm:px-6 ${
      active
        ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
        : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
    }`}
  >
    <span className="text-base">{icon}</span>
    <span className="truncate">{label}</span>
  </button>
);

// 대시보드 탭
const OverviewTab = () => {
  const mockStats = {
    totalUsers: 42,
    activeUsers: 38,
    todayLogins: 156,
    todayScans: 1247,
    successRate: 98.5,
  };

  return (
    <div className="space-y-6">
      {/* 통계 카드 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard title="전체 사용자" value={mockStats.totalUsers.toString()} icon="👥" color="blue" />
        <StatCard title="활성 사용자" value={mockStats.activeUsers.toString()} icon="✅" color="green" />
        <StatCard title="오늘 로그인" value={mockStats.todayLogins.toString()} icon="🔐" color="purple" />
        <StatCard title="오늘 스캔" value={mockStats.todayScans.toString()} icon="📷" color="indigo" />
        <StatCard title="성공률" value={`${mockStats.successRate}%`} icon="📈" color="emerald" />
      </div>

      {/* 최근 활동 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RecentActivity
          title="최근 로그인"
          data={[
            { user: '윤태연', team: '개발팀', time: '5분 전', status: 'success' },
            { user: '김철수', team: '영업팀', time: '12분 전', status: 'success' },
            { user: '박영희', team: '관리팀', time: '1시간 전', status: 'failed' },
          ]}
        />

        <RecentActivity
          title="최근 스캔"
          data={[
            { user: '윤태연', barcode: 'TEST12345', time: '2분 전', status: 'success' },
            { user: '김철수', barcode: 'PROD98765', time: '8분 전', status: 'success' },
            { user: '박영희', barcode: 'ITEM54321', time: '15분 전', status: 'success' },
          ]}
        />
      </div>

      {/* 시스템 상태 */}
      <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-700/50">
        <h3 className="mb-3 font-semibold text-slate-800 dark:text-slate-200">🖥️ 시스템 상태</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <SystemStatus label="API 서버" status="정상" color="green" />
          <SystemStatus label="데이터베이스" status="정상" color="green" />
          <SystemStatus label="로그 수집" status="정상" color="green" />
        </div>
      </div>
    </div>
  );
};

// 로그인 로그 탭
const LoginLogsTab = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'success' | 'failed'>('all');

  const mockLoginLogs = [
    {
      id: 1,
      username: 'okko8522',
      fullName: '윤태연',
      team: '개발팀',
      status: 'success',
      ip: '192.168.1.100',
      time: '2025-01-04 14:30:25',
    },
    {
      id: 2,
      username: 'admin',
      fullName: '관리자',
      team: '관리팀',
      status: 'success',
      ip: '192.168.1.50',
      time: '2025-01-04 14:28:12',
    },
    {
      id: 3,
      username: 'testuser',
      fullName: '테스트',
      team: '테스트팀',
      status: 'failed',
      ip: '192.168.1.200',
      time: '2025-01-04 14:25:45',
    },
    {
      id: 4,
      username: 'user123',
      fullName: '김철수',
      team: '영업팀',
      status: 'success',
      ip: '192.168.1.150',
      time: '2025-01-04 14:22:33',
    },
  ];

  const filteredLogs = mockLoginLogs.filter((log) => {
    const matchesSearch =
      log.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.fullName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || log.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4">
      {/* 필터 */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="사용자명 또는 이름 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-700"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-700"
          >
            <option value="all">전체</option>
            <option value="success">성공</option>
            <option value="failed">실패</option>
          </select>
        </div>

        <div className="text-sm text-slate-600 dark:text-slate-400">총 {filteredLogs.length}건</div>
      </div>

      {/* 로그 테이블 */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700">
              <th className="pb-2 text-left font-medium text-slate-700 dark:text-slate-300">사용자</th>
              <th className="pb-2 text-left font-medium text-slate-700 dark:text-slate-300">팀</th>
              <th className="pb-2 text-left font-medium text-slate-700 dark:text-slate-300">상태</th>
              <th className="pb-2 text-left font-medium text-slate-700 dark:text-slate-300">IP</th>
              <th className="pb-2 text-left font-medium text-slate-700 dark:text-slate-300">시간</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map((log) => (
              <tr key={log.id} className="border-b border-slate-100 dark:border-slate-700/50">
                <td className="py-3">
                  <div>
                    <div className="font-medium text-slate-900 dark:text-slate-100">{log.fullName}</div>
                    <div className="text-slate-500 dark:text-slate-400">{log.username}</div>
                  </div>
                </td>
                <td className="py-3 text-slate-600 dark:text-slate-400">{log.team}</td>
                <td className="py-3">
                  <StatusBadge status={log.status} />
                </td>
                <td className="py-3 font-mono text-slate-600 dark:text-slate-400">{log.ip}</td>
                <td className="py-3 text-slate-600 dark:text-slate-400">{log.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// 스캔 로그 탭
const ScanLogsTab = () => {
  const [searchBarcode, setSearchBarcode] = useState('');

  const mockScanLogs = [
    {
      id: 1,
      username: 'okko8522',
      fullName: '윤태연',
      team: '개발팀',
      barcode: 'TEST12345ABC',
      result: 'success',
      time: '2025-01-04 14:35:12',
    },
    {
      id: 2,
      username: 'admin',
      fullName: '관리자',
      team: '관리팀',
      barcode: 'PROD98765XYZ',
      result: 'success',
      time: '2025-01-04 14:32:45',
    },
    {
      id: 3,
      username: 'user123',
      fullName: '김철수',
      team: '영업팀',
      barcode: 'ITEM54321DEF',
      result: 'failed',
      time: '2025-01-04 14:30:18',
    },
    {
      id: 4,
      username: 'okko8522',
      fullName: '윤태연',
      team: '개발팀',
      barcode: 'CODE39TEST',
      result: 'success',
      time: '2025-01-04 14:28:50',
    },
  ];

  const filteredScans = mockScanLogs.filter(
    (log) =>
      log.barcode.toLowerCase().includes(searchBarcode.toLowerCase()) ||
      log.username.toLowerCase().includes(searchBarcode.toLowerCase()) ||
      log.fullName.toLowerCase().includes(searchBarcode.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      {/* 검색 */}
      <div className="flex items-center justify-between">
        <input
          type="text"
          placeholder="바코드, 사용자명, 이름 검색..."
          value={searchBarcode}
          onChange={(e) => setSearchBarcode(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-700"
        />

        <div className="text-sm text-slate-600 dark:text-slate-400">총 {filteredScans.length}건</div>
      </div>

      {/* 스캔 통계 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">1,247</div>
          <div className="text-sm text-blue-700 dark:text-blue-300">오늘 총 스캔</div>
        </div>
        <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">1,228</div>
          <div className="text-sm text-green-700 dark:text-green-300">성공</div>
        </div>
        <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">19</div>
          <div className="text-sm text-red-700 dark:text-red-300">실패</div>
        </div>
      </div>

      {/* 스캔 로그 테이블 */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700">
              <th className="pb-2 text-left font-medium text-slate-700 dark:text-slate-300">사용자</th>
              <th className="pb-2 text-left font-medium text-slate-700 dark:text-slate-300">바코드</th>
              <th className="pb-2 text-left font-medium text-slate-700 dark:text-slate-300">결과</th>
              <th className="pb-2 text-left font-medium text-slate-700 dark:text-slate-300">시간</th>
            </tr>
          </thead>
          <tbody>
            {filteredScans.map((log) => (
              <tr key={log.id} className="border-b border-slate-100 dark:border-slate-700/50">
                <td className="py-3">
                  <div>
                    <div className="font-medium text-slate-900 dark:text-slate-100">{log.fullName}</div>
                    <div className="text-slate-500 dark:text-slate-400">{log.team}</div>
                  </div>
                </td>
                <td className="py-3">
                  <code className="rounded bg-slate-100 px-2 py-1 text-slate-800 dark:bg-slate-700 dark:text-slate-200">
                    {log.barcode}
                  </code>
                </td>
                <td className="py-3">
                  <StatusBadge status={log.result} />
                </td>
                <td className="py-3 text-slate-600 dark:text-slate-400">{log.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// 사용자 관리 탭
const UsersTab = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);

  const mockUsers = [
    {
      id: 1,
      username: 'admin',
      fullName: '시스템관리자',
      team: '관리자',
      status: 'active',
      type: 'admin',
      lastLogin: '2025-01-04 14:30',
    },
    {
      id: 2,
      username: 'okko8522',
      fullName: '윤태연',
      team: '개발팀',
      status: 'active',
      type: 'user',
      lastLogin: '2025-01-04 14:35',
    },
    {
      id: 3,
      username: 'user123',
      fullName: '김철수',
      team: '영업팀',
      status: 'active',
      type: 'user',
      lastLogin: '2025-01-04 14:22',
    },
    {
      id: 4,
      username: 'testuser',
      fullName: '박영희',
      team: '관리팀',
      status: 'locked',
      type: 'user',
      lastLogin: '2025-01-03 16:45',
    },
  ];

  return (
    <div className="space-y-4">
      {/* 액션 버튼 */}
      <div className="flex justify-between">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">사용자 목록</h3>
        <button
          onClick={() => setShowCreateModal(true)}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700"
        >
          ➕ 사용자 추가
        </button>
      </div>

      {/* 사용자 통계 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-700/50">
          <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">{mockUsers.length}</div>
          <div className="text-sm text-slate-600 dark:text-slate-400">전체 사용자</div>
        </div>
        <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {mockUsers.filter((u) => u.status === 'active').length}
          </div>
          <div className="text-sm text-green-700 dark:text-green-300">활성</div>
        </div>
        <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
            {mockUsers.filter((u) => u.status === 'locked').length}
          </div>
          <div className="text-sm text-red-700 dark:text-red-300">잠금</div>
        </div>
        <div className="rounded-lg bg-purple-50 p-4 dark:bg-purple-900/20">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {mockUsers.filter((u) => u.type === 'admin').length}
          </div>
          <div className="text-sm text-purple-700 dark:text-purple-300">관리자</div>
        </div>
      </div>

      {/* 사용자 테이블 */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700">
              <th className="pb-2 text-left font-medium text-slate-700 dark:text-slate-300">사용자</th>
              <th className="pb-2 text-left font-medium text-slate-700 dark:text-slate-300">팀</th>
              <th className="pb-2 text-left font-medium text-slate-700 dark:text-slate-300">권한</th>
              <th className="pb-2 text-left font-medium text-slate-700 dark:text-slate-300">상태</th>
              <th className="pb-2 text-left font-medium text-slate-700 dark:text-slate-300">마지막 로그인</th>
              <th className="pb-2 text-left font-medium text-slate-700 dark:text-slate-300">액션</th>
            </tr>
          </thead>
          <tbody>
            {mockUsers.map((user) => (
              <tr key={user.id} className="border-b border-slate-100 dark:border-slate-700/50">
                <td className="py-3">
                  <div>
                    <div className="font-medium text-slate-900 dark:text-slate-100">{user.fullName}</div>
                    <div className="text-slate-500 dark:text-slate-400">{user.username}</div>
                  </div>
                </td>
                <td className="py-3 text-slate-600 dark:text-slate-400">{user.team}</td>
                <td className="py-3">
                  <span
                    className={`rounded-full px-2 py-1 text-xs ${
                      user.type === 'admin'
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                    }`}
                  >
                    {user.type === 'admin' ? '관리자' : '사용자'}
                  </span>
                </td>
                <td className="py-3">
                  <StatusBadge status={user.status} />
                </td>
                <td className="py-3 text-slate-600 dark:text-slate-400">{user.lastLogin}</td>
                <td className="py-3">
                  <div className="flex gap-2">
                    <button className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400">수정</button>
                    <button className="text-red-600 hover:text-red-700 dark:text-red-400">비활성화</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 사용자 추가 모달 (간단한 플래그만) */}
      {showCreateModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setShowCreateModal(false)}
        >
          <div className="rounded-xl bg-white p-6 shadow-xl dark:bg-slate-800" onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-4 text-lg font-bold text-slate-900 dark:text-slate-100">사용자 추가</h3>
            <div className="text-center">
              <div className="mb-4 text-4xl">🚧</div>
              <p className="mb-4 text-slate-600 dark:text-slate-400">
                서버 API 구현 후 사용자 등록 기능이 활성화됩니다.
              </p>
              <button
                onClick={() => setShowCreateModal(false)}
                className="rounded-lg bg-slate-600 px-4 py-2 text-white hover:bg-slate-700"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 공통 컴포넌트들

interface StatCardProps {
  title: string;
  value: string;
  icon: string;
  color: string;
}

const StatCard = ({ title, value, icon, color }: StatCardProps) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
    green: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
    indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400',
  };

  return (
    <div className={`rounded-lg p-4 ${colorClasses[color as keyof typeof colorClasses]}`}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-2xl font-bold">{value}</div>
          <div className="text-sm opacity-75">{title}</div>
        </div>
        <div className="text-2xl">{icon}</div>
      </div>
    </div>
  );
};

interface RecentActivityProps {
  title: string;
  data: Array<{
    user: string;
    team?: string;
    barcode?: string;
    time: string;
    status: string;
  }>;
}

const RecentActivity = ({ title, data }: RecentActivityProps) => (
  <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-700/50">
    <h3 className="mb-3 font-semibold text-slate-800 dark:text-slate-200">{title}</h3>
    <div className="space-y-3">
      {data.map((item, index) => (
        <div key={index} className="flex items-center justify-between">
          <div>
            <div className="font-medium text-slate-900 dark:text-slate-100">{item.user}</div>
            <div className="text-sm text-slate-500 dark:text-slate-400">{item.team || item.barcode}</div>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={item.status} size="sm" />
            <span className="text-xs text-slate-500 dark:text-slate-400">{item.time}</span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

interface SystemStatusProps {
  label: string;
  status: string;
  color: 'green' | 'yellow' | 'red';
}

const SystemStatus = ({ label, status, color }: SystemStatusProps) => {
  const colorClasses = {
    green: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    red: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  };

  return (
    <div className="flex items-center justify-between rounded-lg bg-white p-3 dark:bg-slate-800">
      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>
      <span className={`rounded-full px-2 py-1 text-xs ${colorClasses[color]}`}>{status}</span>
    </div>
  );
};

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

const StatusBadge = ({ status, size = 'md' }: StatusBadgeProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'failed':
      case 'locked':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'inactive':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'success':
        return '✅ 성공';
      case 'failed':
        return '❌ 실패';
      case 'active':
        return '🟢 활성';
      case 'inactive':
        return '🟡 비활성';
      case 'locked':
        return '🔒 잠금';
      default:
        return status;
    }
  };

  const sizeClass = size === 'sm' ? 'text-xs px-1.5 py-0.5' : 'text-xs px-2 py-1';

  return (
    <span className={`rounded-full font-medium ${getStatusColor(status)} ${sizeClass}`}>{getStatusText(status)}</span>
  );
};
