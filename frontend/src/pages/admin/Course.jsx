import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import Swal from "sweetalert2";

export default function Course() {
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [searchCourseCode, setSearchCourseCode] = useState("");
  const [editingCourseId, setEditingCourseId] = useState(null); // track if we're updating

  const [formData, setFormData] = useState({
    course_name: "",
    course_code: "",
    credit_hour: "",
    category: "",
  });

  // Fetch courses (search or all)
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

  // Fetch a single course by code for update
  const fetchCourseById = async () => {
    if (!searchCourseCode) {
      toast.error("Please enter course code!");
      return;
    }
    try {
      const res = await fetch(
        `http://localhost/sms/backend/admin/course.php?courseCode=${encodeURIComponent(searchCourseCode)}`,
        { credentials: "include" }
      );
      const data = await res.json();
      if (data && data.course) {
        setFormData({
          course_name: data.course.course_name,
          course_code: data.course.course_code,
          credit_hour: data.course.credit_hour,
          category: data.course.category,
        });
        setEditingCourseId(data.course.id); // enable update mode
        toast.info("Course loaded. Click Update to save changes.");
      } else {
        toast.error("Course not found");
        resetForm();
      }
    } catch {
      toast.error("Could not fetch course");
    }
  };

  // Reset form and editing state
  const resetForm = () => {
    setFormData({ course_name: "", course_code: "", credit_hour: "", category: "" });
    setEditingCourseId(null);
  };

  // Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Add new course
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!formData.course_name || !formData.course_code || !formData.credit_hour || !formData.category) {
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
        resetForm();
      } else {
        toast.error(data.error || "Failed to add course");
      }
    } catch (err) {
      toast.error("Error adding course");
    }
  };

  // Update existing course
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingCourseId) {
      toast.error("No course selected for update. Use Search first.");
      return;
    }
    if (!formData.course_name || !formData.course_code || !formData.credit_hour || !formData.category) {
      return toast.error("Fill all required fields");
    }
    try {
      const res = await fetch(`http://localhost/sms/backend/admin/course.php/${editingCourseId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        fetchCourses();
        resetForm();
      } else {
        toast.error(data.error || "Update failed");
      }
    } catch (err) {
      toast.error("Error updating course");
    }
  };

  // Delete course with confirmation
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });
    if (result.isConfirmed) {
      try {
        const res = await fetch(`http://localhost/sms/backend/admin/course.php/${id}`, {
          method: "DELETE",
          credentials: "include",
        });
        const data = await res.json();
        if (data.success) {
          toast.success(data.message);
          fetchCourses();
          if (editingCourseId === id) resetForm(); // clear form if the deleted course was being edited
        } else {
          toast.error(data.error);
        }
      } catch (err) {
        toast.error("Delete failed");
      }
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  return (
    <div className="p-6 bg-gray-200 h-screen">
      <ToastContainer autoClose={1000} />

      <h1 className="text-3xl font-bold mb-4 text-blue-900">Course Management</h1>

      {/* Search & Update Section */}
      <div className="flex items-center gap-48 mb-4">
        <div className="flex gap-2">
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
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Enter course code to update"
            value={searchCourseCode}
            onChange={(e) => setSearchCourseCode(e.target.value)}
            className="input-style w-64 px-2 py-1 border border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black"
          />
          <button
            onClick={fetchCourseById}
            className="bg-blue-950 text-white px-4 py-2 rounded hover:bg-blue-800"
          >
            Search
          </button>
        </div>
      </div>

      {/* Add / Update Form */}
      <form className="bg-white p-4 rounded shadow mb-6">
        <h2 className="font-semibold mb-3">
          {editingCourseId ? "Update Course" : "Add Course"}
        </h2>
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
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="input-style"
          >
            <option value="">Select Category</option>
            <option value="Major Course">Major Course</option>
            <option value="Supportive Course">Supportive Course</option>
            <option value="Common Course">Common Course</option>
          </select>
        </div>
        <div className="flex items-center gap-4 mt-4">
          {editingCourseId ? (
            <button
              type="button"
              onClick={handleUpdate}
              className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Update Course
            </button>
          ) : (
            <button
              type="button"
              onClick={handleAdd}
              className="bg-blue-900 text-white px-4 py-2 rounded hover:bg-blue-800"
            >
              Add Course
            </button>
          )}
          {editingCourseId && (
            <button
              type="button"
              onClick={resetForm}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-400"
            >
              Cancel Edit
            </button>
          )}
        </div>
      </form>

      {/* Course Table */}
      <div className="bg-white p-4 rounded shadow h-70">
        <h2 className="font-semibold mb-3">Courses</h2>
        <div className="max-h-55 overflow-y-auto">
          <table className="w-full border">
            <thead className="bg-blue-900 text-white">
              <tr>
                <th className="p-2">ID</th>
                <th>Course Name</th>
                <th>Code</th>
                <th>Credit</th>
                <th>Category</th>
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
                    <td>{c.category || "—"}</td>
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
                  <td colSpan="6" className="p-4 text-center">
                    No courses found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}