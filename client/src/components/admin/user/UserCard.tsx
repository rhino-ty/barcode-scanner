import { type AdminUser } from '@/api/admin';

interface UserCardProps {
  user: AdminUser;
}

export const UserCard = ({ user }: UserCardProps) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
      {/* 상단: 이름과 상태 */}
      <div className="mb-3 flex items-start justify-between">
        <div>
          <div className="font-medium text-slate-900 dark:text-slate-100">{user.fullName}</div>
          <div className="text-sm text-slate-500 dark:text-slate-400">@{user.username}</div>
        </div>
        <StatusBadge status={user.userStatus} />
      </div>

      {/* 중간: 사용자 정보 */}
      <div className="mb-3 space-y-1 text-sm">
        <UserInfo label="팀" value={user.teamName || '미지정'} />
        <UserInfo label="로그인 횟수" value={`${user.loginCount}회`} />
        {user.lastLoginAt && (
          <UserInfo label="최근 로그인" value={new Date(user.lastLoginAt).toLocaleDateString('ko-KR')} />
        )}
      </div>

      {/* 하단: 권한 뱃지 */}
      <div className="flex items-center justify-between">
        <UserTypeBadge userType={user.userType} />
        {user.userStatus === 'locked' && <span className="text-xs text-red-600 dark:text-red-400">🔒 계정 잠김</span>}
      </div>
    </div>
  );
};

// 하위 컴포넌트들
interface UserInfoProps {
  label: string;
  value: string;
}

const UserInfo = ({ label, value }: UserInfoProps) => (
  <div className="text-slate-600 dark:text-slate-400">
    <span className="text-xs">{label}:</span> {value}
  </div>
);

interface StatusBadgeProps {
  status: string;
}

const StatusBadge = ({ status }: StatusBadgeProps) => {
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

interface UserTypeBadgeProps {
  userType: string;
}

const UserTypeBadge = ({ userType }: UserTypeBadgeProps) => (
  <span
    className={`rounded-full px-2 py-1 text-xs ${
      userType === 'admin'
        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
        : 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300'
    }`}
  >
    {userType === 'admin' ? '👑 관리자' : '👤 사용자'}
  </span>
);
