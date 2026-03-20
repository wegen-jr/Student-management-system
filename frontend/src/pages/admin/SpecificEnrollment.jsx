import { React, useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { useAuth } from "../../contexts/AuthContext";

export default function SectionEnrollment() {
  const { user } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [studentIdSearch, setStudentIdSearch] = useState(""); 
  const [rooms, setRooms]=useState([]); 

     const [formData, setFormData] = useState({
        year: "",
        semester: "",
        block:"",
        room:"",
        department_id: "",
    });


  useEffect(() => {
    fetch("http://localhost/sms/backend/admin/getDepartment.php", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => setDepartments(data.department))
      .catch((err) => console.error(err));
  }, []);

  const fetchStudentById= async ()=>{
    if(!studentIdSearch){toast.error("please enter id first!")}
    try{
        const res= await fetch(`http://localhost/sms/backend/admin/enrollment.php?studentId=${encodeURIComponent(studentIdSearch)}`,
              {credentials:'include'}
          )
          const data=await res.json();
          if (data && data.student) {
            setFormData((prev) => ({
              ...prev,
              year: data.student.year,
              semester: data.student.semister,
            }));
          } else {
            toast.error("student not found");
          }
      }catch(err){
        console.error(err);
        toast.error('error fetching student')
      }
    }

    const blocks = [...new Set(rooms.map(r => r.block))];
    const filteredRooms = rooms.filter(r => r.block === formData.block)

    useEffect(()=> {
        fetch('http://localhost//sms/backend/admin/classRooms.php',
        { credentials:'include'}
      )
      .then(res=> res.json())
      .then(data=>setRooms(data))
      .catch(err=>console.error(err));
    },[]);
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
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

  const { year, semester, block, room, department_id } = formData;

  if (!year || !semester || !block || !room || !department_id) {
    return toast.error("Please fill all fields");
  }

  if (!studentIdSearch) {
    return toast.error("Please search student first");
  }

  try {
    const res = await fetch(
      `http://localhost/sms/backend/admin/enrollment.php?studentId=${encodeURIComponent(studentIdSearch)}`,
      {
        method: "PUT", // ✅ correct method
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ year, semester, block, room, department_id }),
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
  return (
    <div className="flex flex-col items-center justify-center bg-gray-200 ">
      <div className="my-6 flex items-center gap-2">
              <input
                type="text"
                placeholder="Enter Student ID"
                value={studentIdSearch}
                onChange={(e) => setStudentIdSearch(e.target.value)}
                className="px-4 py-2 border border-blue-400 rounded bg-white text-black w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={fetchStudentById}
                className="bg-blue-950 text-white px-4 py-2 rounded hover:bg-blue-800"
              >
                Search
              </button>
      </div>
      <div className="bg-white p-6 rounded-2xl mt-10 max-w-4xl max-h-96 mb-5">
        <h1 className="text-2xl font-bold text-blue-950">Specific Student Enrollment</h1>
        <ToastContainer autoClose={1000} />
        <p className="text-gray-600 mt-2">Enroll students into a specific section.</p>

        <form className="space-y-6" onSubmit={handleEnrollment}>
          <div className="grid grid-cols-1 w-96 h-82">
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
            <select
              className="input-style"
              name="block"
              value={formData.block}
              onChange={handleChange}
            >
              <option value="">Choose Block</option>
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
            <button
              type="submit"
              className="bg-blue-950 hover:bg-blue-800 text-white font-bold rounded-xl h-20"
            >
              Enroll Section
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}