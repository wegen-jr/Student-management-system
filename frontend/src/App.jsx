import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/auth/Login";
import AdminDashboard from "./pages/admin/AdminDashboard";
import StudentRegistration from "./pages/admin/StudentRegistration";
import TeacherRegistration from "./pages/admin/TeacherRegistration";
import Students from "./pages/admin/Students";
import AdminLayout from "./Layout/AdminLayout";
import EnrollmentLayout from "./Layout/EnrollmentLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import UpdateStudent from "./pages/admin/UpdateStudent";
import Teachers from "./pages/admin/Teachers";
import UpdateTeacher from "./pages/admin/UpdateTeacher";
import Course from './pages/admin/Course';
import StudentEnrollment from './pages/admin/StudentEnrollment';
import CurriculumForm from './pages/admin/CurriculumForm';
import TeacherEnrollment from "./pages/admin/TeacherEnrollment";
import SectionEnrollment from "./pages/admin/SectionEnrollment";
import RegisterRooms from './pages/admin/RegisterRooms';
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="student-registration" element={<StudentRegistration />} />
            <Route path="teacher-registration" element={<TeacherRegistration />} />
            <Route path="update-student" element={<UpdateStudent />} />
            <Route path="update-teacher" element={<UpdateTeacher />} />
            <Route path="students" element={<Students />} />
            <Route path="teachers" element={<Teachers />} />
            <Route path="courses" element={<Course />} />
            <Route path='class-rooms' element={<RegisterRooms />} />
            <Route path="curriculum-form" element={<CurriculumForm />} />

            {/* 2️⃣ Enrollments section */}
            <Route path="enrollments" element={<EnrollmentLayout />}>
              <Route index element={<StudentEnrollment />} /> {/* default page */}
              <Route path="students" element={<StudentEnrollment />} />
              <Route path="teachers" element={<TeacherEnrollment />} /> 
              <Route path="sections" element={<SectionEnrollment />} /> 
            </Route>
          </Route>
      </Routes>
    </Router>
  );
}

export default App;