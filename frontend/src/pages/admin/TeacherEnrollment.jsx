import { React, useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { useAuth } from "../../contexts/AuthContext";

export default function TeacherEnrollment() {
  const { user } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [sections, setSections]=useState([]);

    useEffect(() => {
    // Fetch departments
    fetch("http://localhost/sms/backend/admin/getDepartment.php", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => setDepartments(data.department))
      .catch((err) => console.error(err));
  }, []);

  useEffect(()=>{
    fetch('http://localhost/sms/backend/admin/classRooms.php',
      {credentials:'include'}
    ).then(res=>res.json())
     .then(data=>setSections(data))
     .catch(err=>console.error(err))
   
  },[]);

  const [formData, setFormData] = useState({
    teacherId: "",
    block:"",
    courseCode:"",
    room: "",
    department_id: "",
  });

  // Handle input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };<select name="section"
              className="input-style"
              value={formData.section}
              onChange={handleChange}
            >
              <option value="">Select Class Room</option>
              {[...Array(8).keys()].slice(1).map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>

  // Auto-set department for admin users
  useEffect(() => {
    if (user && user.role === "admin") {
      setFormData((prev) => ({
        ...prev,
        department_id: user.department_id,
      }));
    }
  }, [user]);

  const handleEnrollment = async (e) => {
    e.preventDefault();

    const {teacherId,courseCode, block, room, department_id } = formData;

    if (!teacherId || !courseCode || !block || !room || !department_id  ) {
      return toast.error("Please fill all fields");
    }

    try {
      const res = await fetch(
        "http://localhost/sms/backend/admin/teacherEnrollment.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ teacherId,courseCode,block, room, department_id }),
        }
      );

      const data = await res.json();

      if (data.success) {
        toast.success(data.message);
      } else {
        toast.error(data.error || "Enrollment failed");
      }
    } catch (err) {
      toast.error("Network error");
    }
  };
  const blocks = [...new Set(sections.map(s => s.block))];
  const filteredRooms = sections.filter(s => s.block === formData.block)

  return (
    <div className="flex items-center justify-center bg-gray-200">
      <div className="bg-white p-6 rounded-2xl mt-10 max-w-4xl">
        <h1 className="text-2xl font-bold text-blue-950">Teacher Enrollment</h1>
        <ToastContainer autoClose={1000} />
        <p className="text-gray-600 m-2">
          Manage teacher enrollments in courses.
        </p>

        <form onSubmit={handleEnrollment}>
          <div className="grid grid-cols-1 w-96 h-96">
           <input type="text" 
            name="teacherId"
            className="input-style h-10"
            placeholder="Teacher Id"
            onChange={handleChange}
            value={formData.teacherId}
           />
           <input type="text"
            name="courseCode"           
            className="input-style h-10"
            placeholder="Course Code"
            onChange={handleChange}
            value={formData.courseCode}
           />
           <select
              className="input-style"
              name="block"
              value={formData.block}
              onChange={handleChange}
            >
              <option value="">Choose block</option>
              {blocks.map((block, index) => (
                    <option key={index} value={block}>
                      Block {block}
                    </option>
              ))}
              
            </select>

            <select
              className="input-style"
              name="room"
              value={formData.room}
              onChange={handleChange}
              disabled={!formData.block}
            >
              <option value="">Choose RooM</option>
                {filteredRooms.map((room) => (
                  <option key={room.id} value={room.room}>
                    Room {room.room}
                  </option>
                ))}       
          </select>

            {/* Department */}
            {user?.role === "admin" ? (
              <div className="flex flex-col">
                <label className="text-xs text-gray-500 ml-1">Department</label>
                <input
                  type="text"
                  className="input-style bg-gray-100 cursor-not-allowed"
                  value={departments?.name || "Loading..."}
                  readOnly
                />
                <input
                  type="hidden"
                  name="department_id"
                  value={formData.department_id}
                />
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
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            )}

            {/* Role */}
            <input
              className="input-style"
              type="text"
              name="role"
              value="teacher"
              readOnly
            />

            {/* Submit */}
            <button
              type="submit"
              className="bg-blue-950 hover:bg-blue-800 text-white font-bold rounded-xl"
            >
              Enroll Teacher
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}