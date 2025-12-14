export type UserRole = 'student' | 'faculty' | 'admin';

export interface DepartmentInfo {
  id: string;
  name: string;
  code?: string;
  faculty?: string;
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  first_name?: string | null;
  last_name?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  profile_picture_url?: string | null;
  profilePictureUrl?: string | null;
  is_active?: boolean;
  isActive?: boolean;
  created_at?: string;
  createdAt?: string;
  updated_at?: string;
  updatedAt?: string;
  student?: {
    id?: string;
    student_number?: string;
    enrollment_year?: number;
    gpa?: number | null;
    cgpa?: number | null;
    department?: DepartmentInfo | null;
  } | null;
  faculty?: {
    id?: string;
    employee_number?: string;
    title?: string;
    office_location?: string | null;
    department?: DepartmentInfo | null;
  } | null;
}

export interface AuthTokens {
  accessToken: string | null;
  refreshToken?: string | null;
}

export interface AuthPayload extends AuthTokens {
  user: User | null;
}
