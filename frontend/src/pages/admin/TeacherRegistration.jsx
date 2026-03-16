import {React } from "react";

export default function TeacherRegistration() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      
      <div className="bg-white shadow-2xl rounded-2xl w-full max-w-4xl p-8">
        
        {/* Title */}
        <h2 className="text-3xl font-bold text-blue-950 mb-6 text-center">
          Teacher Registration
        </h2>

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
              />
              <input
                type="text"
                placeholder="middle Name"
                className="input-style"
              />
              <input
                type="text"
                placeholder="last Name"
                className="input-style"
              />    

              <input
                type="text"
                placeholder="Teacher ID"
                className="input-style"
              />

              <input
                type="email"
                placeholder="Email Address"
                className="input-style"
              />

              <input
                type="tel"
                placeholder="Phone Number"
                className="input-style"
              />
              <select className="input-style">
                <option>Gender</option>
                <option>Male</option>
                <option>Female</option>
              </select>

            </div>
          </div>

          {/* Professional Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-3">
              Professional Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <select className="input-style">
                <option value="medicen" >Medicen</option>
                <option>Department</option>
                <option>Computer Science</option>
                <option>Information Technology</option>
                <option>Engineering</option>
              </select>

              <input
                type="text"
                placeholder="Specialization (e.g. AI, Networking)"
                className="input-style"
              />

              <select className="input-style">
                <option>Qualification</option>
                <option>Bachelor's Degree</option>
                <option>Master's Degree</option>
                <option>PhD</option>
              </select>

              <input
                type="number"
                placeholder="Years of Experience"
                className="input-style"
              />
              <input
                type="text"
                placeholder="Office Number"
                className="input-style"
              />

            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-950 text-white py-3 rounded-lg font-semibold
            hover:bg-blue-800 transition duration-300 transform hover:scale-105"
          >
            Register Teacher
          </button>

        </form>
      </div>
    </div>
  );
}