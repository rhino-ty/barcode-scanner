import { useState } from 'react';
import { useAuth } from '@/hooks/auth/useAuth.ts';

export const AdminPage = () => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState<'overview' | 'users' | 'logs'>('overview');

  if (user?.userType !== 'admin') {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
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
      <div className="text-center md:text-left">
        <h1 className="text-2xl font-bold text-slate-900 md:text-3xl dark:text-slate-100">관리자 페이지</h1>
        <p className="mt-1 text-slate-600 dark:text-slate-400">시스템 현황 및 사용자 관리</p>
      </div>

      {/* 섹션 선택 (모바일 친화적) */}
      <div className="flex space-x-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-700">
        <SectionButton
          active={activeSection === 'overview'}
          onClick={() => setActiveSection('overview')}
          icon="📊"
          label="현황"
        />
        <SectionButton
          active={activeSection === 'users'}
          onClick={() => setActiveSection('users')}
          icon="👥"
          label="사용자"
        />
        <SectionButton
          active={activeSection === 'logs'}
          onClick={() => setActiveSection('logs')}
          icon="📋"
          label="로그"
        />
      </div>

      {/* 섹션 컨텐츠 */}
      {activeSection === 'overview' && <OverviewSection />}
      {activeSection === 'users' && <UsersSection />}
      {activeSection === 'logs' && <LogsSection />}
    </div>
  );
};

// 섹션 버튼 컴포넌트
interface SectionButtonProps {
  active: boolean;
  onClick: () => void;
  icon: string;
  label: string;
}

const SectionButton = ({ active, onClick, icon, label }: SectionButtonProps) => (
  <button
    onClick={onClick}
    className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
      active
        ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-600 dark:text-indigo-400'
        : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
    }`}
  >
    <span className="text-base">{icon}</span>
    <span className="hidden sm:inline">{label}</span>
  </button>
);

// 현황 섹션
const OverviewSection = () => {
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
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard title="전체 사용자" value={mockStats.totalUsers.toString()} color="slate" />
        <StatCard title="활성 사용자" value={mockStats.activeUsers.toString()} color="green" />
        <StatCard title="오늘 로그인" value={mockStats.todayLogins.toString()} color="blue" />
        <StatCard title="오늘 스캔" value={mockStats.todayScans.toString()} color="indigo" />
        <StatCard title="성공률" value={`${mockStats.successRate}%`} color="emerald" />
      </div>

      {/* 최근 활동 (모바일 최적화) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ActivityCard
          title="최근 로그인"
          data={[
            { user: '윤태연', detail: '개발팀', time: '5분 전', status: 'success' },
            { user: '김철수', detail: '영업팀', time: '12분 전', status: 'success' },
            { user: '박영희', detail: '관리팀', time: '1시간 전', status: 'failed' },
          ]}
        />

        <ActivityCard
          title="최근 스캔"
          data={[
            { user: '윤태연', detail: 'TEST12345', time: '2분 전', status: 'success' },
            { user: '김철수', detail: 'PROD98765', time: '8분 전', status: 'success' },
            { user: '박영희', detail: 'ITEM54321', time: '15분 전', status: 'success' },
          ]}
        />
      </div>

      {/* 시스템 상태 */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
        <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">시스템 상태</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatusItem label="API 서버" status="정상" color="green" />
          <StatusItem label="데이터베이스" status="정상" color="green" />
          <StatusItem label="로그 수집" status="정상" color="green" />
        </div>
      </div>
    </div>
  );
};

// 사용자 섹션
const UsersSection = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const mockUsers = [
    { id: 1, username: 'admin', fullName: '시스템관리자', team: '관리팀', status: 'active', type: 'admin' },
    { id: 2, username: 'okko8522', fullName: '윤태연', team: '개발팀', status: 'active', type: 'user' },
    { id: 3, username: 'user123', fullName: '김철수', team: '영업팀', status: 'active', type: 'user' },
    { id: 4, username: 'testuser', fullName: '박영희', team: '관리팀', status: 'locked', type: 'user' },
  ];

  const filteredUsers = mockUsers.filter(
    (user) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      {/* 검색 & 통계 */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="text"
          placeholder="사용자 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="rounded-lg border border-slate-300 px-4 py-2 dark:border-slate-600 dark:bg-slate-700"
        />

        <div className="flex gap-4 text-sm text-slate-600 dark:text-slate-400">
          <span>전체: {mockUsers.length}명</span>
          <span>활성: {mockUsers.filter((u) => u.status === 'active').length}명</span>
          <span>관리자: {mockUsers.filter((u) => u.type === 'admin').length}명</span>
        </div>
      </div>

      {/* 사용자 카드 (모바일 친화적) */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredUsers.map((user) => (
          <UserCard key={user.id} user={user} />
        ))}
      </div>
    </div>
  );
};

// 로그 섹션
const LogsSection = () => {
  const [logType, setLogType] = useState<'login' | 'scan'>('login');

  const mockLoginLogs = [
    { id: 1, user: '윤태연', team: '개발팀', status: 'success', time: '14:30', ip: '192.168.1.100' },
    { id: 2, user: '관리자', team: '관리팀', status: 'success', time: '14:28', ip: '192.168.1.50' },
    { id: 3, user: '테스트', team: '테스트팀', status: 'failed', time: '14:25', ip: '192.168.1.200' },
  ];

  const mockScanLogs = [
    { id: 1, user: '윤태연', barcode: 'TEST12345ABC', result: 'success', time: '14:35' },
    { id: 2, user: '관리자', barcode: 'PROD98765XYZ', result: 'success', time: '14:32' },
    { id: 3, user: '김철수', barcode: 'ITEM54321DEF', result: 'failed', time: '14:30' },
  ];

  return (
    <div className="space-y-4">
      {/* 로그 타입 선택 */}
      <div className="flex gap-2">
        <button
          onClick={() => setLogType('login')}
          className={`rounded-lg px-4 py-2 text-sm font-medium ${
            logType === 'login'
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
          }`}
        >
          로그인 로그
        </button>
        <button
          onClick={() => setLogType('scan')}
          className={`rounded-lg px-4 py-2 text-sm font-medium ${
            logType === 'scan'
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
          }`}
        >
          스캔 로그
        </button>
      </div>

      {/* 로그 목록 (카드형 - 모바일 친화적) */}
      <div className="space-y-3">
        {logType === 'login'
          ? mockLoginLogs.map((log) => (
              <LogCard key={log.id}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <StatusDot status={log.status} />
                    <div>
                      <div className="font-medium text-slate-900 dark:text-slate-100">{log.user}</div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">{log.team}</div>
                    </div>
                  </div>
                  <div className="text-right text-sm text-slate-500 dark:text-slate-400">
                    <div>{log.time}</div>
                    <div className="text-xs">{log.ip}</div>
                  </div>
                </div>
              </LogCard>
            ))
          : mockScanLogs.map((log) => (
              <LogCard key={log.id}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <StatusDot status={log.result} />
                    <div>
                      <div className="font-medium text-slate-900 dark:text-slate-100">{log.user}</div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">
                        <code className="rounded bg-slate-100 px-1 dark:bg-slate-700">{log.barcode}</code>
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">{log.time}</div>
                </div>
              </LogCard>
            ))}
      </div>
    </div>
  );
};

// 공통 컴포넌트들
interface StatCardProps {
  title: string;
  value: string;
  color: string;
}

const StatCard = ({ title, value, color }: StatCardProps) => {
  const colorClasses = {
    slate: 'bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
    green: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
    indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400',
  };

  return (
    <div
      className={`rounded-xl border p-4 ${colorClasses[color as keyof typeof colorClasses]} border-slate-200 dark:border-slate-700`}
    >
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm opacity-75">{title}</div>
    </div>
  );
};

interface ActivityCardProps {
  title: string;
  data: Array<{
    user: string;
    detail: string;
    time: string;
    status: string;
  }>;
}

const ActivityCard = ({ title, data }: ActivityCardProps) => (
  <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
    <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
    <div className="space-y-3">
      {data.map((item, index) => (
        <div key={index} className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <StatusDot status={item.status} />
            <div>
              <div className="font-medium text-slate-900 dark:text-slate-100">{item.user}</div>
              <div className="text-sm text-slate-500 dark:text-slate-400">{item.detail}</div>
            </div>
          </div>
          <span className="text-sm text-slate-500 dark:text-slate-400">{item.time}</span>
        </div>
      ))}
    </div>
  </div>
);

interface UserCardProps {
  user: {
    username: string;
    fullName: string;
    team: string;
    status: string;
    type: string;
  };
}

const UserCard = ({ user }: UserCardProps) => (
  <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
    <div className="mb-3 flex items-start justify-between">
      <div>
        <div className="font-medium text-slate-900 dark:text-slate-100">{user.fullName}</div>
        <div className="text-sm text-slate-500 dark:text-slate-400">{user.username}</div>
      </div>
      <StatusBadge status={user.status} />
    </div>

    <div className="flex items-center justify-between text-sm">
      <span className="text-slate-600 dark:text-slate-400">{user.team}</span>
      <span
        className={`rounded-full px-2 py-1 text-xs ${
          user.type === 'admin'
            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
            : 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300'
        }`}
      >
        {user.type === 'admin' ? '관리자' : '사용자'}
      </span>
    </div>
  </div>
);

const LogCard = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
    {children}
  </div>
);

const StatusItem = ({ label, status, color }: { label: string; status: string; color: string }) => {
  const colorClasses = {
    green: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    red: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  };

  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-700 dark:text-slate-300">{label}</span>
      <span className={`rounded-full px-2 py-1 text-xs ${colorClasses[color as keyof typeof colorClasses]}`}>
        {status}
      </span>
    </div>
  );
};

const StatusDot = ({ status }: { status: string }) => {
  const getColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-500';
      case 'failed':
        return 'bg-red-500';
      case 'locked':
        return 'bg-yellow-500';
      default:
        return 'bg-slate-500';
    }
  };

  return <div className={`h-2 w-2 rounded-full ${getColor(status)}`} />;
};

const StatusBadge = ({ status }: { status: string }) => {
  const getStyles = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'locked':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'inactive':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
    }
  };

  const getText = (status: string) => {
    switch (status) {
      case 'active':
        return '활성';
      case 'locked':
        return '잠금';
      case 'inactive':
        return '비활성';
      default:
        return status;
    }
  };

  return <span className={`rounded-full px-2 py-1 text-xs font-medium ${getStyles(status)}`}>{getText(status)}</span>;
};
