import {React, use, useEffect, useState} from 'react'
import { toast, ToastContainer } from "react-toastify";
import { useAuth } from "../../contexts/AuthContext";
export default function StudentEnrollment() {
  const { user } = useAuth();
   const [departments, setDepartments] = useState([]);
    useEffect(() => {
      // 3. Only fetch all departments if the user is a super_admin
      // Otherwise, you only need the name of the current admin's department
      fetch("http://localhost/sms/backend/admin/getDepartment.php",{
        credentials: "include"
      }
      )
        .then(res => res.json())
        .then(data => setDepartments(data.department))
        .catch(err => console.error(err));
    }, []);
  

  const [formData, setFormData] = useState({
    year: "",
    semester: "",
    department_id: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  const handleEnrollment = async (e) => {
    e.preventDefault();
    // Enrollment logic will go here
  };

  return (
    <div className='flex flex-col items-center justify-center bg-gray-200 h-screen '>
        <div className='bg-white p-6 rounded shadow mt-10 w-full max-w-4xl'>
            <h1 className='text-2xl font-bold text-blue-950'>Student Enrollment</h1>
            <p className='text-gray-600 mt-2'>Manage student enrollments in courses.</p>
            {/* Enrollment form and list will go here */}
            <form className="space-y-6" onSubmit={handleEnrollment}>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                              <select
              className="input-style"
              name="year"
              value={formData.year}
              onChange={handleChange}
            >
              <option value="">Select Year</option>
              {[...Array(8).keys()].slice(1).map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <select
              className="input-style"
              name="semester"
              value={formData.semester}
              onChange={handleChange}
            >
              <option value="">Select Semester</option>
              <option value="1">1</option>
              <option value="2">2</option>
            </select>
             {/* 4. Conditional Department Field */}
              {user?.role === "admin" ? (
                <div className="flex flex-col">
                  <label className="text-xs text-gray-500 ml-1">Department</label>
                  <input
                    type="text"
                    className="input-style bg-gray-100 cursor-not-allowed"
                    value={departments?.name || "Loading..."}
                    readOnly
                  />
                  {/* Hidden input to ensure department_id is in the form if needed */}
                  <input type="hidden" name="department_id" value={formData.department_id} />
                </div>
              ) : (
                <select
                  className="input-style"
                  name="department_id"
                  value={formData.department_id}
                  onChange={handleChange}
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
              )}
            <input 
              className='input-style'
              type="text"
              name="role" 
              value="student"
              readOnly
               />
              </div>

            </form>
        </div>
    </div>
  )
}
