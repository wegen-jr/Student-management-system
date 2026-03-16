import {React, useState} from 'react'
import { toast, ToastContainer } from "react-toastify";

export default function StudentRegistration() {
  const [formData, setFormData] = useState({
    studentId: "",  
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    role:"student",
    year: "",  
    department: "",       
    gender: "",
    semester: "",
  });
  const handleChange= (e) => {
    e.preventDefault();
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  }    
    const validateForm = () => {
    // Required fields
    const requiredFields = [
      "firstName",
      "middleName",
      "lastName",
      "studentId",
      "email",
      "gender",
      "department",
      "year",
      "semester"
    ];

    for (const field of requiredFields) {
      if (!formData[field] || formData[field].trim() === "" || formData[field] === field) {
        toast.error(`Please fill in your ${field.replace(/([A-Z])/g, " $1")}`);
        return false;
      }
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return false;
    }

    return true;
  };

  const handleRegistration = async (e) => {
    e.preventDefault(); 
 if (!validateForm()) return; // Stop if invalid
    try{
      const res=await fetch("http://localhost/sms/backend/admin/student.php",
        {
          method:'POST',
          headers:{"Content-Type":"application/json"},
          credentials:"include",
          body:JSON.stringify(formData)
        }
      );
      const data=await res.json();
      if(data.success){
        toast.success(data.message);
        setFormData({
          firstName: "",
          middleName: "",
          lastName: "",
          studentId: "",
          email: "",
      });
    }else{
        toast.error(data.error || "Registration failed");
      }
    }catch(err){
      console.error("Error:", err);
      toast.error("An error occurred during registration");
    }
  }
 
  return (
    <div className='flex flex-col items-center justify-center bg-gray-200 h-screen'>

      <div className="bg-white shadow-2xl rounded-2xl w-full max-w-4xl p-8">
        
        {/* Title */}
        <h2 className="text-3xl font-bold text-blue-950 mb-6 text-center">
          Student Registration
        </h2>
          <ToastContainer
            autoClose={1000}
          />
      <form className="space-y-6">
        {/* Personal Information */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-3">
            Personal Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="First Name"
              className="input-style"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
            />
            <input
              type="text"
              placeholder="Middle Name"
              className="input-style"
              name="middleName"
              value={formData.middleName}
              onChange={handleChange}
            />
            <input
              type="text"
              placeholder="Last Name"
              className="input-style"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
            />
            <input
              type="text"
              placeholder="Student ID"
              className="input-style"
              name="studentId"
              value={formData.studentId}
              onChange={handleChange}
            />
            <input
              type="email"
              placeholder="Email Address"
              className="input-style"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
            <select
              className="input-style"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
        </div>

        {/* Academic Information */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-3">
            Academic Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              className="input-style"
              name="department"
              value={formData.department}
              onChange={handleChange}
            >
              <option value="">Select Department</option>
              <option value="Freshman">Freshman</option>
              <option value="Medicen">Medicen</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Engineering">Engineering</option>
            </select>

            <select
              className="input-style"
              name="year"
              value={formData.year}
              onChange={handleChange}
            >
              <option value="">Select Year</option>
              {[...Array(7).keys()].slice(1).map((y) => (
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
            <input 
              className='input-style'
              type="text"
              name="role" 
              value="student"
              readOnly
               />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          onClick={handleRegistration}
          className="w-full bg-blue-950 text-white py-3 rounded-lg font-semibold
            hover:bg-blue-800 transition duration-300 transform hover:scale-105"
        >
          Register Student
        </button>
      </form>
      </div>
    </div>
  )
}
