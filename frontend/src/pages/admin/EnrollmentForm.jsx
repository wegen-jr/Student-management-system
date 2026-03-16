import { useState } from "react";

export default function EnrollmentForm() {
  const [role, setRole] = useState("student");

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center p-6">
      <div className="bg-white shadow-2xl rounded-2xl w-full max-w-4xl p-8">

        <h2 className="text-3xl font-bold text-blue-950 text-center mb-6">
          Course Enrollment
        </h2>

        {/* Switch */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            type="button"
            onClick={() => setRole("student")}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              role === "student"
                ? "bg-blue-950 text-white"
                : "bg-gray-200"
            }`}
          >
            Student Enrollment
          </button>

          <button
            type="button"
            onClick={() => setRole("teacher")}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              role === "teacher"
                ? "bg-blue-950 text-white"
                : "bg-gray-200"
            }`}
          >
            Teacher Assignment
          </button>
        </div>

        <form className="space-y-6">

          {/* STUDENT ENROLLMENT */}
          {role === "student" && (
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-700">
                Department Section Assignment
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <select className="input-style">
                  <option>Select Department</option>
                  <option>Computer Science</option>
                  <option>Information Technology</option>
                  <option>Engineering</option>
                </select>

                <select className="input-style">
                  <option>Select Year</option>
                  <option>1</option>
                  <option>2</option>
                  <option>3</option>
                  <option>4</option>
                </select>

                <select className="input-style">
                  <option>Select Semester</option>
                  <option>1</option>
                  <option>2</option>
                </select>

                <select className="input-style">
                  <option>Assign Section</option>
                  <option>Section A</option>
                  <option>Section B</option>
                  <option>Section C</option>
                </select>

                <input
                  type="date"
                  className="input-style"
                  placeholder="Effective Date"
                />

              </div>
            </div>
          )}

          {/* TEACHER ASSIGNMENT */}
          {role === "teacher" && (
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-700">
                Teacher Course Assignment
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <select className="input-style">
                  <option>Select Teacher</option>
                  <option>Dr. Smith</option>
                  <option>Prof. John</option>
                </select>

                <select className="input-style">
                  <option>Select Course</option>
                  <option>Database Systems</option>
                  <option>Web Development</option>
                </select>

                <select className="input-style">
                  <option>Select Section</option>
                  <option>Section A</option>
                  <option>Section B</option>
                </select>

                <input type="date" className="input-style" />
              </div>
            </div>
          )}

          {/* Submit */}
          <button
            className="w-full bg-blue-950 text-white py-3 rounded-lg font-semibold
            hover:bg-blue-800 transition duration-300 transform hover:scale-105"
          >
            {role === "student"
              ? "Assign Section to Department"
              : "Assign Teacher"}
          </button>

        </form>
      </div>
    </div>
  );
}