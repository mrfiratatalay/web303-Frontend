import { UserRole } from './auth';

export type DashboardRole = UserRole;

export interface DashboardClass {
  courseCode?: string;
  courseName?: string;
  sectionNumber?: string;
  day?: string;
  startTime?: string;
  endTime?: string;
  classroom?: string | null;
  status?: 'upcoming' | 'in_progress' | 'completed';
  nextDate?: string;
}

export interface DashboardGrade {
  courseCode?: string;
  courseName?: string;
  sectionNumber?: string;
  midterm?: number | null;
  final?: number | null;
  letter?: string | null;
  gradePoint?: number | null;
  updatedAt?: string;
}

export interface DashboardActivity {
  type?: string;
  title?: string;
  detail?: string | null;
  timestamp?: string;
}

export interface StudentDashboard {
  role: 'student';
  summary: {
    registeredCourses: number;
    gpa: number;
    cgpa: number;
    attendanceRate: number;
    todayCourseCount: number;
  };
  todayClasses: DashboardClass[];
  recentGrades: DashboardGrade[];
}

export interface FacultyDashboard {
  role: 'faculty';
  summary: {
    sectionCount: number;
    studentCount: number;
    pendingGrades: number;
    pendingExcuses: number;
    activeSessions: number;
    upcomingClassCount: number;
  };
  upcomingSessions: DashboardClass[];
  pendingActions: Array<{ label: string; value: number; helper?: string }>;
}

export interface AdminDashboard {
  role: 'admin';
  summary: {
    totalStudents: number;
    facultyCount: number;
    activeCourses: number;
    activeSections: number;
    totalUsers: number;
  };
  systemStatus: {
    api: string;
    database: string;
    checkedAt: string;
    uptimeSeconds?: number;
  };
  recentActivities: DashboardActivity[];
}

export type DashboardData = StudentDashboard | FacultyDashboard | AdminDashboard;
