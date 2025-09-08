import { useState } from 'react';
import { useLoginLogs, useScanLogs } from '@/hooks/admin/useAdmin';
import { LoadingSpinner } from '@/components/Loading';
import { LogCard } from './LogCard';
import { LogTabs } from './LogTabs';
import { Pagination } from '@/components/Pagination';

type LogType = 'login' | 'scan';

export const LogsSection = () => {
  const [logType, setLogType] = useState<LogType>('login');
  const [page, setPage] = useState(1);

  const { data: loginLogs, isLoading: loginLoading } = useLoginLogs({ page, limit: 20 });
  const { data: scanLogs, isLoading: scanLoading } = useScanLogs({ page, limit: 20 });

  const currentData = logType === 'login' ? loginLogs : scanLogs;
  const isLoading = logType === 'login' ? loginLoading : scanLoading;

  const handleLogTypeChange = (newLogType: LogType) => {
    setLogType(newLogType);
    setPage(1); // 로그 타입 변경시 첫 페이지로
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <LogTabs activeLogType={logType} onLogTypeChange={handleLogTypeChange} />

      <LogsList logType={logType} loginLogs={loginLogs?.logs || []} scanLogs={scanLogs?.logs || []} />

      {currentData && currentData.totalPages > 1 && (
        <Pagination currentPage={page} totalPages={currentData.totalPages} onPageChange={setPage} />
      )}
    </div>
  );
};

// 하위 컴포넌트들
interface LogsListProps {
  logType: LogType;
  loginLogs: any[];
  scanLogs: any[];
}

const LogsList = ({ logType, loginLogs, scanLogs }: LogsListProps) => {
  const logs = logType === 'login' ? loginLogs : scanLogs;

  if (logs.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="text-slate-500 dark:text-slate-400">📝 표시할 로그가 없습니다</div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {logs.map((log) => (
        <LogCard key={log.logId} log={log} type={logType} />
      ))}
    </div>
  );
};
