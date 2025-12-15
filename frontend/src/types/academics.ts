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

export type SemesterType = 'fall' | 'spring' | 'summer';

export interface ScheduleItem {
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  start_time: string;
  end_time: string;
}

export interface Section {
  id: string;
  course_id: string;
  section_number: string;
  semester: SemesterType;
  year: number;
  instructor_id: string;
  capacity: number;
  enrolled_count?: number;
  schedule_json?: ScheduleItem[];
  classroom_id?: string | null;
  course?: Course;
  instructor?: { id: string; first_name?: string; last_name?: string; email?: string };
  classroom?: Classroom;
}

export interface SectionListQuery {
  page?: number;
  limit?: number;
  course_id?: string;
  instructor_id?: string;
  semester?: SemesterType;
  year?: number;
  sort_by?: 'course_id' | 'section_number' | 'year' | 'created_at';
  sort_order?: 'ASC' | 'DESC' | 'asc' | 'desc';
}

export interface SectionListResult {
  sections: Section[];
  pagination: PaginationMeta;
}

export type EnrollmentStatus = 'enrolled' | 'dropped' | 'completed' | 'failed' | 'withdrawn';

export interface Enrollment {
  id: string;
  student_id: string;
  section_id: string;
  status: EnrollmentStatus;
  enrollment_date?: string;
  drop_date?: string | null;
  midterm_grade?: number | null;
  final_grade?: number | null;
  letter_grade?: string | null;
  grade_point?: number | null;
  section?: Section;
}

export interface EnrollmentQuery {
  semester?: SemesterType;
  year?: number;
  status?: EnrollmentStatus;
}

export interface ScheduleEntry {
  courseCode?: string;
  courseName?: string;
  sectionNumber?: string;
  day?: string;
  startTime?: string;
  endTime?: string;
  classroom?: string;
}

export interface GradeEntry {
  enrollment_id: string;
  midterm_grade?: number | null;
  final_grade?: number | null;
  letter_grade?: string | null;
  grade_point?: number | null;
  section?: Section;
}

export interface Classroom {
  id: string;
  building?: string;
  room_number?: string;
  capacity?: number;
  latitude?: number;
  longitude?: number;
}

export interface TranscriptCourse {
  code: string;
  name: string;
  credits: number;
  ects?: number;
  letterGrade?: string | null;
  gradePoint?: number | null;
}

export interface TranscriptSemester {
  semester: SemesterType;
  year: number;
  courses: TranscriptCourse[];
  gpa?: number;
  totalCredits?: number;
  totalPoints?: number;
}

export interface Transcript {
  student: {
    firstName?: string;
    lastName?: string;
    studentNumber?: string;
    department?: string;
    enrollmentYear?: number;
  };
  semesters: TranscriptSemester[];
  cgpa?: number;
  generatedAt?: string;
}

export interface AttendanceSession {
  id: string;
  section_id: string;
  instructor_id: string;
  date: string;
  start_time: string;
  end_time?: string | null;
  latitude: number;
  longitude: number;
  geofence_radius: number;
  qr_code: string;
  qr_expires_at?: string | null;
  status: 'active' | 'closed' | 'cancelled';
  section?: Section;
  records?: AttendanceRecord[];
}

export interface AttendanceRecord {
  id?: string;
  session_id: string;
  student_id: string;
  check_in_time?: string;
  latitude?: number;
  longitude?: number;
  distance_from_center?: number;
  is_flagged?: boolean;
  flag_reason?: string | null;
}

export interface AttendanceReport {
  sectionId?: string;
  totalSessions?: number;
  attendanceRate?: number;
  students?: Array<{
    studentId?: string;
    studentNumber?: string;
    name?: string;
    attendanceRate?: number;
    absences?: number;
  }>;
}

export interface AttendanceSummary {
  courseCode: string;
  courseName: string;
  sectionNumber: string;
  totalSessions: number;
  attendedSessions: number;
  absenceCount: number;
  attendanceRate: number;
  absenceRate: number;
  status: string;
}

export interface ExcuseRequest {
  id: string;
  student_id?: string;
  session_id: string;
  reason: string;
  document_url?: string | null;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string | null;
  session?: AttendanceSession;
  student?: {
    id: string;
    user?: { first_name?: string; last_name?: string };
  };
}
