export type ExportFormat = 'csv' | 'json';

export type AnalyticsType = 'academic' | 'attendance' | 'meal' | 'event';

// Admin Dashboard Analytics
export interface AnalyticsDashboard {
  totalStudents: number;
  totalFaculty: number;
  totalCourses: number;
  totalSections: number;
  activeUsers: number;
  averageAttendanceRate: number;
  averageGPA: number;
  mealUsageToday: number;
  upcomingEvents: number;
  systemHealth: {
    status: 'healthy' | 'warning' | 'critical';
    uptime: number;
    lastCheck: string;
  };
}

// Academic Performance Analytics
export interface GradeDistribution {
  grade: string;
  count: number;
  percentage: number;
}

export interface TopStudent {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  gpa: number;
  cgpa: number;
  totalCredits: number;
}

export interface DepartmentPerformance {
  departmentId: string;
  departmentName: string;
  averageGPA: number;
  studentCount: number;
  topPerformers: number;
}

export interface AcademicPerformance {
  overallStats: {
    averageGPA: number;
    averageCGPA: number;
    totalStudents: number;
    passingRate: number;
  };
  gradeDistribution: GradeDistribution[];
  topStudents: TopStudent[];
  departmentPerformance: DepartmentPerformance[];
  semesterTrends: {
    semester: string;
    averageGPA: number;
    studentCount: number;
  }[];
}

// Attendance Analytics
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
  overallStats: {
    totalSessions: number;
    averageAttendanceRate: number;
    totalExcuses: number;
    approvedExcuses: number;
  };
  sectionAttendance: SectionAttendance[];
  attendanceTrends: {
    date: string;
    attendanceRate: number;
    sessionCount: number;
  }[];
  lowAttendanceStudents: {
    studentId: string;
    studentName: string;
    attendanceRate: number;
    totalAbsences: number;
  }[];
}

// Meal Usage Analytics
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
  overallStats: {
    totalReservations: number;
    totalUsage: number;
    usageRate: number;
    totalRevenue: number;
  };
  cafeteriaUsage: CafeteriaUsage[];
  popularMeals: PopularMeal[];
  usageTrends: {
    date: string;
    reservations: number;
    usage: number;
    revenue: number;
  }[];
  peakHours: {
    hour: number;
    usageCount: number;
  }[];
}

// Event Analytics
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
  overallStats: {
    totalEvents: number;
    totalRegistrations: number;
    totalCheckIns: number;
    averageAttendanceRate: number;
  };
  eventPerformance: EventPerformance[];
  eventTypeTrends: {
    eventType: string;
    count: number;
    averageAttendance: number;
  }[];
  registrationTrends: {
    date: string;
    registrations: number;
    checkIns: number;
  }[];
  popularEvents: {
    eventId: string;
    eventName: string;
    registrations: number;
    attendanceRate: number;
  }[];
}
