type LogType = 'login' | 'scan';

interface LogTabsProps {
  activeLogType: LogType;
  onLogTypeChange: (logType: LogType) => void;
}

export const LogTabs = ({ activeLogType, onLogTypeChange }: LogTabsProps) => {
  const tabs = [
    {
      id: 'login' as const,
      label: '로그인 로그',
      icon: '🔐',
      description: '사용자 로그인 시도 이력',
    },
    {
      id: 'scan' as const,
      label: '스캔 로그',
      icon: '📷',
      description: '바코드 스캔 활동 이력',
    },
  ];

  return (
    <div className="space-y-2">
      {/* 탭 버튼들 */}
      <div className="flex gap-2">
        {tabs.map((tab) => (
          <TabButton
            key={tab.id}
            tab={tab}
            isActive={activeLogType === tab.id}
            onClick={() => onLogTypeChange(tab.id)}
          />
        ))}
      </div>

      {/* 현재 탭 설명 */}
      <div className="text-sm text-slate-600 dark:text-slate-400">
        {tabs.find((tab) => tab.id === activeLogType)?.description}
      </div>
    </div>
  );
};

// 하위 컴포넌트
interface TabButtonProps {
  tab: {
    id: LogType;
    label: string;
    icon: string;
    description: string;
  };
  isActive: boolean;
  onClick: () => void;
}

const TabButton = ({ tab, isActive, onClick }: TabButtonProps) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
      isActive
        ? 'bg-indigo-600 text-white'
        : 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
    }`}
  >
    <span>{tab.icon}</span>
    <span className="hidden sm:inline">{tab.label}</span>
  </button>
);
