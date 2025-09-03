import { Link } from 'react-router';
import { useAuth } from '@/hooks/auth/useAuth';

export const HomePage = () => {
  const { user } = useAuth();

  const quickActions = [
    {
      to: '/scanner',
      title: '바코드 스캐너',
      description: 'CODE128 바코드를 스캔하여 제품 정보를 확인하세요',
      icon: '📷',
      color: 'bg-indigo-500 hover:bg-indigo-600',
    },
    {
      to: '/scan-logs',
      title: '스캔 이력',
      description: '최근 스캔한 바코드 이력을 확인하세요',
      icon: '📊',
      color: 'bg-emerald-500 hover:bg-emerald-600',
    },
  ];

  return (
    <div className="space-y-8">
      {/* 환영 메시지 */}
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold text-slate-900 dark:text-slate-100">
          환영합니다, {user?.fullName}님! 👋
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          바코드 스캐너 시스템으로 효율적인 업무를 시작하세요
        </p>
      </div>

      {/* 빠른 액션 카드들 */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {quickActions.map((action) => (
          <Link
            key={action.to}
            to={action.to}
            className="group rounded-xl bg-white p-6 shadow-lg transition-transform hover:scale-105 dark:bg-slate-800"
          >
            <div className="flex items-start space-x-4">
              <div className={`rounded-lg p-3 text-2xl text-white ${action.color}`}>{action.icon}</div>
              <div>
                <h3 className="text-xl font-semibold text-slate-900 group-hover:text-indigo-600 dark:text-slate-100">
                  {action.title}
                </h3>
                <p className="mt-2 text-slate-600 dark:text-slate-400">{action.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* 사용자 정보 요약 */}
      <div className="rounded-xl bg-white p-6 shadow-lg dark:bg-slate-800">
        <h3 className="mb-4 text-xl font-semibold text-slate-900 dark:text-slate-100">내 정보</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-700">
            <div className="text-sm text-slate-600 dark:text-slate-400">사용자명</div>
            <div className="font-semibold text-slate-900 dark:text-slate-100">{user?.username}</div>
          </div>
          {user?.teamName && (
            <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-700">
              <div className="text-sm text-slate-600 dark:text-slate-400">소속팀</div>
              <div className="font-semibold text-slate-900 dark:text-slate-100">{user.teamName}</div>
            </div>
          )}
          <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-700">
            <div className="text-sm text-slate-600 dark:text-slate-400">권한</div>
            <div className="font-semibold text-slate-900 dark:text-slate-100">
              {user?.userType === 'admin' ? '관리자' : '일반 사용자'}
            </div>
          </div>
        </div>
      </div>

      {/* 사용 가이드 */}
      <div className="rounded-xl bg-blue-50 p-6 dark:bg-blue-900/20">
        <h3 className="mb-4 text-lg font-semibold text-blue-900 dark:text-blue-300">💡 사용 가이드</h3>
        <div className="space-y-2 text-blue-800 dark:text-blue-400">
          <div className="flex items-start">
            <span className="mr-2">1.</span>
            <span>상단 메뉴에서 "바코드 스캐너"를 클릭하여 스캔을 시작하세요</span>
          </div>
          <div className="flex items-start">
            <span className="mr-2">2.</span>
            <span>CODE128 바코드를 카메라로 스캔하면 자동으로 인식됩니다</span>
          </div>
          <div className="flex items-start">
            <span className="mr-2">3.</span>
            <span>"스캔 이력"에서 과거 스캔 기록을 확인할 수 있습니다</span>
          </div>
        </div>
      </div>
    </div>
  );
};
