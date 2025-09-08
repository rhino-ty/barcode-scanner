import type { LoginLog, ScanLog } from '@/api/admin';

interface LogCardProps {
  log: LoginLog | ScanLog;
  type: 'login' | 'scan';
}

export const LogCard = ({ log, type }: LogCardProps) => {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-center justify-between">
        <LogInfo log={log} type={type} />
        <LogTime log={log} type={type} />
      </div>
    </div>
  );
};

// 하위 컴포넌트들
interface LogInfoProps {
  log: LoginLog | ScanLog;
  type: 'login' | 'scan';
}

const LogInfo = ({ log, type }: LogInfoProps) => (
  <div className="flex items-center gap-3">
    <StatusDot status={getLogStatus(log, type)} />
    <div>
      <div className="font-medium text-slate-900 dark:text-slate-100">
        {log.fullName || log.username || 'Unknown User'}
      </div>
      <LogDetail log={log} type={type} />
    </div>
  </div>
);

interface LogDetailProps {
  log: LoginLog | ScanLog;
  type: 'login' | 'scan';
}

const LogDetail = ({ log, type }: LogDetailProps) => {
  if (type === 'login') {
    const loginLog = log as LoginLog;
    return (
      <div className="text-sm text-slate-500 dark:text-slate-400">
        {loginLog.teamName || 'No Team'}
        {loginLog.failureReason && (
          <span className="ml-2 text-red-600 dark:text-red-400">({loginLog.failureReason})</span>
        )}
      </div>
    );
  }

  const scanLog = log as ScanLog;
  return (
    <div className="text-sm text-slate-500 dark:text-slate-400">
      <code className="rounded bg-slate-100 px-1 text-xs dark:bg-slate-700">{scanLog.scannedBarcode}</code>
      {scanLog.errorMessage && <div className="mt-1 text-red-600 dark:text-red-400">{scanLog.errorMessage}</div>}
    </div>
  );
};

interface LogTimeProps {
  log: LoginLog | ScanLog;
  type: 'login' | 'scan';
}

const LogTime = ({ log, type }: LogTimeProps) => {
  const timestamp = type === 'login' ? (log as LoginLog).loginAt : (log as ScanLog).scannedAt;

  const date = new Date(timestamp);

  return (
    <div className="text-right text-sm text-slate-500 dark:text-slate-400">
      <div>{date.toLocaleDateString('ko-KR')}</div>
      <div className="text-xs">{date.toLocaleTimeString('ko-KR')}</div>
      {type === 'login' && (log as LoginLog).ipAddress && (
        <div className="text-xs opacity-75">{(log as LoginLog).ipAddress}</div>
      )}
    </div>
  );
};

// 상태 점 컴포넌트
interface StatusDotProps {
  status: string;
}

const StatusDot = ({ status }: StatusDotProps) => {
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

// 유틸리티 함수
const getLogStatus = (log: LoginLog | ScanLog, type: 'login' | 'scan'): string => {
  if (type === 'login') {
    return (log as LoginLog).loginStatus;
  }
  return (log as ScanLog).scanResult;
};
