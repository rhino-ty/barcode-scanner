import type { CreateUserRequest } from '@/api/admin';

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string[]>;
  warnings?: Record<string, string[]>;
}

/**
 * 폼 데이터 정제 - 빈 문자열과 공백 처리
 */
export const cleanUserFormData = (data: CreateUserRequest): CreateUserRequest => {
  const cleaned = { ...data };

  // 모든 문자열 필드에 대해 처리
  Object.keys(cleaned).forEach((key) => {
    const value = cleaned[key as keyof CreateUserRequest];

    if (typeof value === 'string') {
      // 공백 제거
      const trimmed = value.trim();

      // 필수 필드는 빈 값이면 그대로 두고 (검증에서 걸리도록)
      // 선택적 필드는 빈 값이면 undefined로 변환
      const requiredFields = ['username', 'password', 'fullName'];

      if (requiredFields.includes(key)) {
        cleaned[key as keyof CreateUserRequest] = trimmed as any;
      } else {
        // 선택적 필드는 빈 값이면 undefined로 변환
        cleaned[key as keyof CreateUserRequest] = trimmed === '' ? undefined : (trimmed as any);
      }
    }
  });

  return cleaned;
};

/**
 * 클라이언트 사이드 검증
 */
export const validateUserFormData = (data: CreateUserRequest): ValidationResult => {
  const errors: Record<string, string[]> = {};
  const warnings: Record<string, string[]> = {};

  // 필수 필드 검증
  if (!data.username || data.username.trim() === '') {
    errors.username = ['사용자명을 입력해주세요.'];
  } else {
    if (data.username.length < 3) {
      errors.username = ['사용자명은 최소 3자 이상이어야 합니다.'];
    } else if (data.username.length > 50) {
      errors.username = ['사용자명은 최대 50자까지 입력할 수 있습니다.'];
    } else if (!/^[a-zA-Z0-9_]+$/.test(data.username)) {
      errors.username = ['사용자명은 영문, 숫자, 언더스코어(_)만 사용할 수 있습니다.'];
    }
  }

  if (!data.password || data.password.trim() === '') {
    errors.password = ['비밀번호를 입력해주세요.'];
  } else {
    if (data.password.length < 6) {
      errors.password = ['비밀번호는 최소 6자 이상이어야 합니다.'];
    } else if (data.password.length > 128) {
      errors.password = ['비밀번호는 최대 128자까지 입력할 수 있습니다.'];
    }

    // 비밀번호 강도 경고 (에러는 아니지만 권고사항)
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(data.password)) {
      warnings.password = ['보안을 위해 영문 대소문자와 숫자를 포함하는 것을 권장합니다.'];
    }
  }

  if (!data.fullName || data.fullName.trim() === '') {
    errors.fullName = ['이름을 입력해주세요.'];
  } else if (data.fullName.length > 100) {
    errors.fullName = ['이름은 최대 100자까지 입력할 수 있습니다.'];
  }

  // 선택적 필드 검증 (값이 있을 때만)
  if (data.email && data.email.trim() !== '') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      errors.email = ['올바른 이메일 형식이 아닙니다.'];
    } else if (data.email.length > 100) {
      errors.email = ['이메일은 최대 100자까지 입력할 수 있습니다.'];
    }
  }

  if (data.phone && data.phone.trim() !== '') {
    const phoneRegex = /^[0-9-+\s()]+$/;
    if (!phoneRegex.test(data.phone)) {
      errors.phone = ['전화번호는 숫자, 하이픈(-), 플러스(+), 공백, 괄호만 사용할 수 있습니다.'];
    } else if (data.phone.length > 20) {
      errors.phone = ['전화번호는 최대 20자까지 입력할 수 있습니다.'];
    }
  }

  if (data.teamCode && data.teamCode.length > 50) {
    errors.teamCode = ['팀 코드는 최대 50자까지 입력할 수 있습니다.'];
  }

  if (data.teamName && data.teamName.length > 100) {
    errors.teamName = ['팀명은 최대 100자까지 입력할 수 있습니다.'];
  }

  if (data.employeeNo && data.employeeNo.length > 20) {
    errors.employeeNo = ['사번은 최대 20자까지 입력할 수 있습니다.'];
  }

  if (data.position && data.position.length > 50) {
    errors.position = ['직급은 최대 50자까지 입력할 수 있습니다.'];
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    warnings: Object.keys(warnings).length > 0 ? warnings : undefined,
  };
};

/**
 * 에러 메시지 포맷팅
 */
export const formatValidationErrors = (errors: Record<string, string[]>): string => {
  return Object.entries(errors)
    .map(([field, messages]) => `${getFieldDisplayName(field)}: ${messages.join(', ')}`)
    .join('\n');
};

/**
 * 필드명을 사용자 친화적 이름으로 변환
 */
const getFieldDisplayName = (field: string): string => {
  const fieldNames: Record<string, string> = {
    username: '사용자명',
    password: '비밀번호',
    fullName: '이름',
    email: '이메일',
    phone: '전화번호',
    teamCode: '팀 코드',
    teamName: '팀명',
    employeeNo: '사번',
    position: '직급',
    userType: '권한',
  };

  return fieldNames[field] || field;
};
