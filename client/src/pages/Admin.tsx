import { useState } from 'react';
import { AdminGuard } from '@/components/admin/AdminGuard';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { SectionTabs } from '@/components/admin/SectionTabs';
import { OverviewSection } from '@/components/admin/overview/OverviewSection';
import { UsersSection } from '@/components/admin/user/UsersSection';
import { LogsSection } from '@/components/admin/log/LogsSection';

type AdminSection = 'overview' | 'users' | 'logs';

export const AdminPage = () => {
  return (
    <AdminGuard>
      <AdminContent />
    </AdminGuard>
  );
};

const AdminContent = () => {
  const [activeSection, setActiveSection] = useState<AdminSection>('overview');

  return (
    <div className="space-y-6">
      <AdminHeader />

      <SectionTabs activeSection={activeSection} onSectionChange={setActiveSection} />

      {/* 섹션별 컨텐츠 */}
      {activeSection === 'overview' && <OverviewSection />}
      {activeSection === 'users' && <UsersSection />}
      {activeSection === 'logs' && <LogsSection />}
    </div>
  );
};
