import { User, UserRole } from './auth';

export type UserSortField = 'createdAt' | 'firstName' | 'lastName' | 'email';
export type SortOrder = 'asc' | 'desc';

export interface UserListQuery {
  page?: number;
  limit?: number;
  role?: UserRole;
  search?: string;
  departmentId?: string;
  sortBy?: UserSortField;
  sortOrder?: SortOrder;
}

export interface Pagination {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export interface UserListResult {
  users: User[];
  pagination: Pagination;
}
