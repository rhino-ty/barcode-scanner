interface UserSearchBarProps {
  searchTerm: string;
  onSearch: (search: string) => void;
  totalCount: number;
  currentCount: number;
  onCreateUser: () => void;
}

export const UserSearchBar = ({ searchTerm, onSearch, totalCount, currentCount, onCreateUser }: UserSearchBarProps) => {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <input
        type="text"
        placeholder="사용자 검색..."
        value={searchTerm}
        onChange={(e) => onSearch(e.target.value)}
        className="rounded-lg border border-slate-300 px-4 py-2 dark:border-slate-600 dark:bg-slate-700"
      />

      <div className="flex items-center gap-4">
        <div className="flex gap-4 text-sm text-slate-600 dark:text-slate-400">
          <span>전체: {totalCount}명</span>
          <span>현재: {currentCount}명</span>
        </div>

        <button
          type="button"
          onClick={onCreateUser}
          className="cursor-pointer rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          사용자 추가
        </button>
      </div>
    </div>
  );
};
