import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import Swal from "sweetalert2";
export default function Course() {
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");

  const [formData, setFormData] = useState({
    course_name: "",
    course_code: "",
    credit_hour: "",
  });

  // 🔹 Fetch courses
  const fetchCourses = async (query = "") => {
    try {
      const res = await fetch(
        `http://localhost/sms/backend/admin/course.php?search=${encodeURIComponent(query)}`,
        { credentials: "include" }
      );
      const data = await res.json();
      setCourses(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch courses");
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  // 🔹 Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 🔹 Add course
  const handleAdd = async (e) => {
    e.preventDefault();

    if (!formData.course_name || !formData.course_code) {
      return toast.error("Fill all required fields");
    }

    try {
      const res = await fetch("http://localhost/sms/backend/admin/course.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        fetchCourses();
        setFormData({ course_name: "", course_code: "", credit_hour: "" });
      } else {
        toast.error(data.error || "Failed to add course");
      }
    } catch (err) {
      toast.error("Error adding course");
    }
  };

  // 🔹 Delete course
  const handleDelete = async (id) => {
      Swal.fire({ 
        title: "Are you sure?",
        text: "This action cannot be undone.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "Cancel"
      }).then(async(result) => {
        if (result.isConfirmed) {
          toast.success("Deleting course...");
          await deleteCourse(id);
        }
        if (result.isDismissed) {
          toast.info("Delete cancelled");
          return;
        }
      });
  };

  const deleteCourse = async (id) => {
    try {
      const res = await fetch(`http://localhost/sms/backend/admin/course.php/${id}`, {
            method: "DELETE",
          });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        fetchCourses();
      } else {
        toast.error(data.error);
      }
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="p-6 bg-gray-200 min-h-screen">
      <ToastContainer autoClose={1000} />

      <h1 className="text-3xl font-bold mb-4 text-blue-900">Course Management</h1>

      {/* 🔍 Search */}
      <div className="mb-4 flex gap-2">
        <input
          type="text"
          placeholder="Search course..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            fetchCourses(e.target.value);
          }}
          className="input-style w-64 px-2 py-1 rounded-full border border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black"
        />
      </div>

      {/* ➕ Add Course */}
      <form onSubmit={handleAdd} className="bg-white p-4 rounded shadow mb-6">
        <h2 className="font-semibold mb-3">Add Course</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            name="course_name"
            placeholder="Course Name"
            value={formData.course_name}
            onChange={handleChange}
            className="input-style"
          />

          <input
            type="text"
            name="course_code"
            placeholder="Course Code"
            value={formData.course_code}
            onChange={handleChange}
            className="input-style"
          />

          <input
            type="number"
            name="credit_hour"
            placeholder="Credit Hour"
            value={formData.credit_hour}
            onChange={handleChange}
            className="input-style"
          />
        </div>

        <button type="submit" className="mt-4 bg-blue-900 text-white px-4 py-2 rounded">
          Add Course
        </button>
      </form>

      {/* 📋 Course Table */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="font-semibold mb-3">Courses</h2>

        <table className="w-full border">
          <thead className="bg-blue-900 text-white">
            <tr>
              <th className="p-2">ID</th>
              <th>Course Name</th>
              <th>Code</th>
              <th>Credit</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {courses.length > 0 ? (
              courses.map((c) => (
                <tr key={c.id} className="text-center border-t">
                  <td className="p-2">{c.id}</td>
                  <td>{c.course_name}</td>
                  <td>{c.course_code}</td>
                  <td>{c.credit_hour}</td>
                  <td>
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="bg-red-600 text-white px-2 py-1 rounded hover:cursor-pointer"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="p-4 text-center">
                  No courses found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}