import { useState } from 'react';
import { type CreateUserRequest } from '@/api/admin';
import { LoadingSpinner } from '@/components/Loading';

interface CreateUserModalProps {
  onClose: () => void;
  onSubmit: (userData: CreateUserRequest) => void;
  isLoading: boolean;
}

export const CreateUserModal = ({ onClose, onSubmit, isLoading }: CreateUserModalProps) => {
  const [formData, setFormData] = useState<CreateUserRequest>({
    username: '',
    password: '',
    fullName: '',
    // 선택
    email: '',
    phone: '',
    teamCode: '',
    teamName: '',
    employeeNo: '',
    position: '',
    userType: 'user',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.username || !formData.password || !formData.fullName) {
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }

    onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const isFormValid = !!(formData.username && formData.password && formData.fullName);

  return (
    <>
      {/* 오버레이 */}
      <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose} />

      {/* 모달 */}
      <div className="fixed inset-x-4 top-1/2 z-50 max-h-[90vh] -translate-y-1/2 overflow-y-auto rounded-xl bg-white shadow-xl md:inset-x-auto md:left-1/2 md:w-full md:max-w-md md:-translate-x-1/2 dark:bg-slate-800">
        {/* 헤더 */}
        <ModalHeader onClose={onClose} isLoading={isLoading} />

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          {/* 필수 정보 */}
          <RequiredFields formData={formData} onChange={handleChange} isLoading={isLoading} />

          {/* 선택 정보 */}
          <OptionalFields formData={formData} onChange={handleChange} isLoading={isLoading} />

          {/* 버튼 */}
          <ModalActions onClose={onClose} isLoading={isLoading} isFormValid={isFormValid} />
        </form>
      </div>
    </>
  );
};

// ====== 하위 컴포넌트들 =======
interface ModalHeaderProps {
  onClose: () => void;
  isLoading: boolean;
}

const ModalHeader = ({ onClose, isLoading }: ModalHeaderProps) => (
  <div className="border-b border-slate-200 p-6 dark:border-slate-700">
    <div className="flex items-center justify-between">
      <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">👤 사용자 추가</h2>
      <button
        onClick={onClose}
        disabled={isLoading}
        className="rounded-lg p-1 hover:bg-slate-100 disabled:opacity-50 dark:hover:bg-slate-700"
      >
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  </div>
);

interface FormFieldsProps {
  formData: CreateUserRequest;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  isLoading: boolean;
}

const RequiredFields = ({ formData, onChange, isLoading }: FormFieldsProps) => (
  <>
    <FormField
      label="사용자명"
      name="username"
      type="text"
      value={formData.username}
      onChange={onChange}
      disabled={isLoading}
      required
      placeholder="3자 이상 (영문, 숫자, 언더스코어)"
    />

    <FormField
      label="비밀번호"
      name="password"
      type="password"
      value={formData.password}
      onChange={onChange}
      disabled={isLoading}
      required
      placeholder="최소 6자 이상"
    />

    <FormField
      label="이름"
      name="fullName"
      type="text"
      value={formData.fullName}
      onChange={onChange}
      disabled={isLoading}
      required
      placeholder="실명 입력"
    />
  </>
);

const OptionalFields = ({ formData, onChange, isLoading }: FormFieldsProps) => (
  <>
    <div className="grid grid-cols-2 gap-4">
      <FormField
        label="팀 코드"
        name="teamCode"
        type="text"
        value={formData.teamCode || ''}
        onChange={onChange}
        disabled={isLoading}
      />

      <FormField
        label="팀명"
        name="teamName"
        type="text"
        value={formData.teamName || ''}
        onChange={onChange}
        disabled={isLoading}
      />
    </div>

    <FormField
      label="권한"
      name="userType"
      type="select"
      value={formData.userType || 'user'}
      onChange={onChange}
      disabled={isLoading}
      options={[
        { value: 'user', label: '일반 사용자' },
        { value: 'admin', label: '관리자' },
      ]}
    />
  </>
);

interface FormFieldProps {
  label: string;
  name: string;
  type: 'text' | 'password' | 'email' | 'select';
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
}

const FormField = ({
  label,
  name,
  type,
  value,
  onChange,
  disabled,
  required,
  placeholder,
  options,
}: FormFieldProps) => (
  <div>
    <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
      {label} {required && <span className="text-red-500">*</span>}
    </label>

    {type === 'select' ? (
      <select
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-700"
      >
        {options?.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    ) : (
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-700"
      />
    )}
  </div>
);

interface ModalActionsProps {
  onClose: () => void;
  isLoading: boolean;
  isFormValid: boolean;
}

const ModalActions = ({ onClose, isLoading, isFormValid }: ModalActionsProps) => (
  <div className="flex space-x-3 pt-4">
    <button
      type="button"
      onClick={onClose}
      disabled={isLoading}
      className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
    >
      취소
    </button>

    <button
      type="submit"
      disabled={isLoading || !isFormValid}
      className="flex-1 rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-50"
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <LoadingSpinner size="sm" className="mr-2" />
          생성 중...
        </div>
      ) : (
        '생성'
      )}
    </button>
  </div>
);
