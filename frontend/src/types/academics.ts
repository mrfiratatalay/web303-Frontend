export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Department {
  id: string;
  name: string;
  code?: string;
  faculty?: string;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  credits: number;
  ects: number;
  syllabus_url?: string | null;
  department_id: string;
  department?: Department;
  prerequisites?: Array<Pick<Course, 'id' | 'code' | 'name'>>;
  prerequisiteTree?: PrerequisiteNode | null;
  created_at?: string;
  updated_at?: string;
}

export interface PrerequisiteNode {
  courseId: string;
  code?: string;
  name?: string;
  prerequisites?: PrerequisiteNode[];
}

export interface CourseListQuery {
  page?: number;
  limit?: number;
  department_id?: string;
  search?: string;
  sort_by?: 'code' | 'name' | 'credits' | 'created_at';
  sort_order?: 'ASC' | 'DESC' | 'asc' | 'desc';
}

export interface CourseListResult {
  courses: Course[];
  pagination: PaginationMeta;
}
