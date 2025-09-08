export const SystemStatus = () => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
      <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">시스템 상태</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatusItem label="API 서버" status="정상" color="green" />
        <StatusItem label="데이터베이스" status="정상" color="green" />
        <StatusItem label="로그 수집" status="정상" color="green" />
      </div>
    </div>
  );
};

interface StatusItemProps {
  label: string;
  status: string;
  color: 'green' | 'yellow' | 'red';
}

const StatusItem = ({ label, status, color }: StatusItemProps) => {
  const colorClasses = {
    green: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    red: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  };

  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-700 dark:text-slate-300">{label}</span>
      <span className={`rounded-full px-2 py-1 text-xs ${colorClasses[color]}`}>{status}</span>
    </div>
  );
};
