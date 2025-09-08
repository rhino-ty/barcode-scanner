import { useState } from 'react';
import { useUsers, useCreateUser } from '@/hooks/admin/useAdmin';
import { type CreateUserRequest } from '@/api/admin';
import { LoadingSpinner } from '@/components/Loading';
import { UserSearchBar } from './UserSearchBar';
import { UserCard } from './UserCard';
import { CreateUserModal } from './CreateUserModal';
import { Pagination } from '@/components/Pagination';

export const UsersSection = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const {
    data: usersData,
    isLoading,
    error,
  } = useUsers({
    search: searchTerm,
    page,
    limit: 20,
  });

  const createUserMutation = useCreateUser();

  const handleCreateUser = async (userData: CreateUserRequest) => {
    try {
      await createUserMutation.mutateAsync(userData);
      setShowCreateModal(false);
      setPage(1);
    } catch (error) {
      console.error('Failed to create user:', error);
    }
  };

  const handleSearch = (search: string) => {
    setSearchTerm(search);
    setPage(1);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-800 dark:bg-red-900/30">
        <p className="text-red-700 dark:text-red-400">사용자 목록을 불러오는 중 오류가 발생했습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <UserSearchBar
        searchTerm={searchTerm}
        onSearch={handleSearch}
        totalCount={usersData?.total || 0}
        currentCount={usersData?.users?.length || 0}
        onCreateUser={() => setShowCreateModal(true)}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {usersData?.users?.map((user) => <UserCard key={user.userId} user={user} />) || []}
      </div>

      {usersData && usersData.totalPages > 1 && (
        <Pagination currentPage={page} totalPages={usersData.totalPages} onPageChange={setPage} showFirstLast />
      )}

      {showCreateModal && (
        <CreateUserModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateUser}
          isLoading={createUserMutation.isPending}
        />
      )}
    </div>
  );
};
