import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/routing/ProtectedRoute';
import Layout from './components/layout/Layout';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import VerifyEmailPage from './pages/auth/VerifyEmailPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import ProfilePage from './pages/profile/ProfilePage';
import NotFoundPage from './pages/error/NotFoundPage';
import UserManagementPage from './pages/admin/UserManagementPage';
import MenuManagementPage from './pages/admin/MenuManagementPage';
import EventManagementPage from './pages/admin/EventManagementPage';
import CourseListPage from './pages/courses/CourseListPage';
import CourseDetailPage from './pages/courses/CourseDetailPage';
import CourseFormPage from './pages/courses/CourseFormPage';
import SectionListPage from './pages/sections/SectionListPage';
import SectionDetailPage from './pages/sections/SectionDetailPage';
import SectionFormPage from './pages/sections/SectionFormPage';
import StudentEnrollmentsPage from './pages/enrollments/StudentEnrollmentsPage';
import StudentSchedulePage from './pages/enrollments/StudentSchedulePage';
import FacultySectionStudentsPage from './pages/enrollments/FacultySectionStudentsPage';
import StudentGradesPage from './pages/grades/StudentGradesPage';
import TranscriptPage from './pages/grades/TranscriptPage';
import FacultyGradeEntryPage from './pages/grades/FacultyGradeEntryPage';
import FacultyGradeBulkPage from './pages/grades/FacultyGradeBulkPage';
import FacultySessionsPage from './pages/attendance/FacultySessionsPage';
import SessionDetailPage from './pages/attendance/SessionDetailPage';
import AttendanceReportPage from './pages/attendance/AttendanceReportPage';
import StudentCheckInPage from './pages/attendance/StudentCheckInPage';
import MyAttendancePage from './pages/attendance/MyAttendancePage';
import ExcuseSubmitPage from './pages/attendance/ExcuseSubmitPage';
import FacultyExcusesPage from './pages/attendance/FacultyExcusesPage';
import WalletPage from './pages/wallet/WalletPage';
import EventListPage from './pages/events/EventListPage';
import EventDetailPage from './pages/events/EventDetailPage';
import MyRegistrationsPage from './pages/events/MyRegistrationsPage';
import EventRegistrationsPage from './pages/events/EventRegistrationsPage';
import EventCheckInPage from './pages/events/EventCheckInPage';
import ReservationCreatePage from './pages/reservations/ReservationCreatePage';
import ReservationListPage from './pages/reservations/ReservationListPage';
import MyReservationsPage from './pages/reservations/MyReservationsPage';
import MealCafeteriasPage from './pages/meals/MealCafeteriasPage';
import MealMenusPage from './pages/meals/MealMenusPage';
import MealMenuDetailPage from './pages/meals/MealMenuDetailPage';
import MealReservationsPage from './pages/meals/MealReservationsPage';
import MealQrUsePage from './pages/meals/MealQrUsePage';
import MySchedulePage from './pages/scheduling/MySchedulePage';
import ScheduleDetailPage from './pages/scheduling/ScheduleDetailPage';
import GenerateSchedulePage from './pages/scheduling/GenerateSchedulePage';


function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <UserManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/menus"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <MenuManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/meals/menus/:id"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <MenuManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/events"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <EventManagementPage />
            </ProtectedRoute>
          }
        />
        <Route path="/courses" element={<CourseListPage />} />
        <Route path="/courses/:id" element={<CourseDetailPage />} />
        <Route
          path="/admin/courses/new"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <CourseFormPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/courses/:id/edit"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <CourseFormPage />
            </ProtectedRoute>
          }
        />
        <Route path="/sections" element={<SectionListPage />} />
        <Route path="/sections/:id" element={<SectionDetailPage />} />
        <Route
          path="/admin/sections/new"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <SectionFormPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/sections/:id/edit"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <SectionFormPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/enrollments/my"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentEnrollmentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/enrollments/schedule"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentSchedulePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/faculty/sections/students"
          element={
            <ProtectedRoute allowedRoles={['faculty', 'admin']}>
              <FacultySectionStudentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/grades/my"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentGradesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/grades/transcript"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <TranscriptPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/faculty/grades/entry"
          element={
            <ProtectedRoute allowedRoles={['faculty', 'admin']}>
              <FacultyGradeEntryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/faculty/grades/bulk"
          element={
            <ProtectedRoute allowedRoles={['faculty', 'admin']}>
              <FacultyGradeBulkPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/attendance/sessions"
          element={
            <ProtectedRoute allowedRoles={['faculty', 'admin']}>
              <FacultySessionsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/attendance/sessions/:id"
          element={
            <ProtectedRoute>
              <SessionDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/attendance/report"
          element={
            <ProtectedRoute allowedRoles={['faculty', 'admin']}>
              <AttendanceReportPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/attendance/checkin"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentCheckInPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/attendance/my"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <MyAttendancePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/attendance/excuse"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <ExcuseSubmitPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/attendance/excuse/review"
          element={
            <ProtectedRoute allowedRoles={['faculty', 'admin']}>
              <FacultyExcusesPage />
            </ProtectedRoute>
          }
        />

        <Route path="/wallet" element={<WalletPage />} />

        <Route path="/events" element={<EventListPage />} />
        <Route path="/events/checkin"
          element={
            <ProtectedRoute allowedRoles={['faculty', 'admin']}>
              <EventCheckInPage />
            </ProtectedRoute>
          }
        />
        <Route path="/events/my-registrations" element={<MyRegistrationsPage />} />
        <Route
          path="/events/:id/registrations"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <EventRegistrationsPage />
            </ProtectedRoute>
          }
        />
        <Route path="/events/:id" element={<EventDetailPage />} />

        <Route
          path="/reservations/new"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <ReservationCreatePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reservations/my"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <MyReservationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reservations"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ReservationListPage />
            </ProtectedRoute>
          }
        />

        <Route path="/meals/cafeterias" element={<MealCafeteriasPage />} />
        <Route path="/meals/menus" element={<MealMenusPage />} />
        <Route path="/meals/menus/:id" element={<MealMenuDetailPage />} />
        <Route
          path="/meals/reservations"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <MealReservationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/meals/qr-use"
          element={
            <ProtectedRoute allowedRoles={['faculty', 'admin']}>
              <MealQrUsePage />
            </ProtectedRoute>
          }
        />

        <Route path="/scheduling/my" element={<MySchedulePage />} />
        <Route path="/scheduling/:scheduleId" element={<ScheduleDetailPage />} />
        <Route
          path="/scheduling/generate"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <GenerateSchedulePage />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
