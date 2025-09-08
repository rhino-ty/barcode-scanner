type AdminSection = 'overview' | 'users' | 'logs';

interface SectionTabsProps {
  activeSection: AdminSection;
  onSectionChange: (section: AdminSection) => void;
}

export const SectionTabs = ({ activeSection, onSectionChange }: SectionTabsProps) => {
  const tabs = [
    { id: 'overview' as const, icon: '📊', label: '현황' },
    { id: 'users' as const, icon: '👥', label: '사용자' },
    { id: 'logs' as const, icon: '📋', label: '로그' },
  ];

  return (
    <div className="flex space-x-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-700">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onSectionChange(tab.id)}
          className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-md px-4 py-2 text-base font-medium transition-colors ${
            activeSection === tab.id
              ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-600 dark:text-indigo-400'
              : 'text-slate-600 hover:bg-white hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-600 dark:hover:text-slate-200'
          }`}
        >
          <span className="text-lg">{tab.icon}</span>
          <span className="inline">{tab.label}</span>
        </button>
      ))}
    </div>
  );
};
