export type UserRole = 'student' | 'faculty' | 'admin';

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
  student?: {
    student_number?: string;
    department?: { id: string; name: string; code?: string } | null;
  } | null;
  faculty?: {
    employee_number?: string;
    title?: string;
    department?: { id: string; name: string; code?: string } | null;
  } | null;
}

export interface AuthTokens {
  accessToken: string | null;
  refreshToken?: string | null;
}

export interface AuthPayload extends AuthTokens {
  user: User | null;
}
