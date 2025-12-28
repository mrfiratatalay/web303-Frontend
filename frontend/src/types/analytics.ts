export type ExportFormat = 'csv' | 'json' | 'excel' | 'pdf';

export type AnalyticsType = 'academic' | 'attendance' | 'meal' | 'event';

// Admin Dashboard Analytics - Backend yapısına uygun
export interface AnalyticsDashboard {
  totalUsers: number;
  activeUsersToday: number;
  totalCourses: number;
  totalEnrollments: number;
  attendanceRate: number;
  mealReservationsToday: number;
  upcomingEvents: number;
  systemHealth: string;
  // Frontend'de kullanılan eski alanlar için uyumluluk
  totalStudents?: number;
  totalFaculty?: number;
  totalSections?: number;
  activeUsers?: number;
  averageAttendanceRate?: number;
  averageGPA?: number;
  mealUsageToday?: number;
}

// Academic Performance Analytics - Backend yapısına uygun
export interface GradeDistribution {
  letter_grade: string;
  count: number;
  // Frontend uyumluluğu
  grade?: string;
  percentage?: number;
}

export interface TopStudent {
  id: number;
  student_number: string;
  gpa: number;
  cgpa: number;
  user: {
    first_name: string;
    last_name: string;
  };
  // Frontend uyumluluğu
  firstName?: string;
  lastName?: string;
  email?: string;
  totalCredits?: number;
}

export interface AtRiskStudent {
  id: number;
  student_number: string;
  gpa: number;
  user: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

export interface DepartmentPerformance {
  department_id: number;
  averageGpa: string;
  studentCount: number;
  // Frontend uyumluluğu
  departmentId?: string;
  departmentName?: string;
  averageGPA?: number;
  topPerformers?: number;
}

export interface AcademicPerformance {
  gpaByDepartment: DepartmentPerformance[];
  gradeDistribution: GradeDistribution[];
  passRate: number;
  failRate: number;
  topStudents: TopStudent[];
  atRiskStudents: AtRiskStudent[];
  // Frontend uyumluluğu
  overallStats?: {
    averageGPA: number;
    averageCGPA: number;
    totalStudents: number;
    passingRate: number;
  };
  departmentPerformance?: DepartmentPerformance[];
  semesterTrends?: {
    semester: string;
    averageGPA: number;
    studentCount: number;
  }[];
}

// Attendance Analytics - Backend yapısına uygun
export interface AttendanceByCourse {
  section_id: number;
  totalSessions: number;
  section: {
    section_number: string;
    course: {
      code: string;
      name: string;
    };
  };
}

export interface AttendanceTrend {
  date: string;
  sessionsCount: number;
  // Frontend uyumluluğu
  attendanceRate?: number;
  sessionCount?: number;
}

export interface CriticalAbsence {
  id: number;
  student_number: string;
  user: {
    first_name: string;
    last_name: string;
    email: string;
  };
  attendanceRecords: any[];
}

export interface SectionAttendance {
  sectionId: string;
  courseCode: string;
  courseName: string;
  sectionNumber: string;
  instructorName: string;
  totalSessions: number;
  averageAttendanceRate: number;
  totalStudents: number;
}

export interface AttendanceAnalytics {
  attendanceByCourse: AttendanceByCourse[];
  attendanceTrends: AttendanceTrend[];
  criticalAbsences: CriticalAbsence[];
  lowAttendanceCourses: any[];
  // Frontend uyumluluğu
  overallStats?: {
    totalSessions: number;
    averageAttendanceRate: number;
    totalExcuses: number;
    approvedExcuses: number;
  };
  sectionAttendance?: SectionAttendance[];
  lowAttendanceStudents?: {
    studentId: string;
    studentName: string;
    attendanceRate: number;
    totalAbsences: number;
  }[];
}

// Meal Usage Analytics - Backend yapısına uygun
export interface DailyMealCount {
  date: string;
  count: number;
}

export interface PeakHour {
  hour: number;
  count: number;
  // Frontend uyumluluğu
  usageCount?: number;
}

export interface UsageStats {
  used: number;
  cancelled: number;
}

export interface CafeteriaUsage {
  cafeteriaId: string;
  cafeteriaName: string;
  totalReservations: number;
  totalUsage: number;
  usageRate: number;
  revenue: number;
}

export interface PopularMeal {
  mealId: string;
  mealName: string;
  category: string;
  reservationCount: number;
  usageCount: number;
}

export interface MealUsageReport {
  dailyMealCounts: DailyMealCount[];
  mealTypeDistribution: { count: number }[];
  totalRevenue: number;
  peakHours: PeakHour[];
  usageStats: UsageStats;
  // Frontend uyumluluğu
  overallStats?: {
    totalReservations: number;
    totalUsage: number;
    usageRate: number;
    totalRevenue: number;
  };
  cafeteriaUsage?: CafeteriaUsage[];
  popularMeals?: PopularMeal[];
  usageTrends?: {
    date: string;
    reservations: number;
    usage: number;
    revenue: number;
  }[];
}

// Event Analytics - Backend yapısına uygun
export interface PopularEvent {
  id: number;
  title: string;
  category: string;
  date: string;
  capacity: number;
  registrationCount: number;
}

export interface RegistrationByCategory {
  category: string;
  eventCount: number;
  totalCapacity: number;
}

export interface EventByCategory {
  category: string;
  count: number;
}

export interface EventPerformance {
  eventId: string;
  eventName: string;
  eventType: string;
  totalRegistrations: number;
  totalCheckIns: number;
  attendanceRate: number;
  capacity: number;
  utilizationRate: number;
  eventDate: string;
}

export interface EventStatistics {
  popularEvents: PopularEvent[];
  registrationsByCategory: RegistrationByCategory[];
  checkInRate: number;
  totalRegistrations: number;
  checkedInCount: number;
  eventsByCategory: EventByCategory[];
  // Frontend uyumluluğu
  overallStats?: {
    totalEvents: number;
    totalRegistrations: number;
    totalCheckIns: number;
    averageAttendanceRate: number;
  };
  eventPerformance?: EventPerformance[];
  eventTypeTrends?: {
    eventType: string;
    count: number;
    averageAttendance: number;
  }[];
  registrationTrends?: {
    date: string;
    registrations: number;
    checkIns: number;
  }[];
}
