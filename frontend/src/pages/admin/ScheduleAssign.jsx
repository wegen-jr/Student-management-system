import React, { useEffect, useState } from 'react'

export default function ScheduleAssign() {
    const [enrollment,setEnrollment]=useState([]);
    const [loading,setLoading]=useState('');
   useEffect(() => {
    async function fetchEnrollments() {
      try {
        const res = await fetch(
          'http://localhost/sms/backend/admin/getTeacherEnrollment.php',
          { credentials: "include" }
        );
        const data = await res.json();

        if (data.success) {
          setEnrollment(data.data); // <-- this is the array of rows
        } else {
          console.error(data.message || "No data found");
        }
      } catch (err) {
        console.error("Network error", err);
      } finally {
        setLoading(false);
      }
    }

    fetchEnrollments();
  }, []);
  return (
    <div className="bg-gray-200 p-6 h-screen" > 
        <p className='text-3xl text-blue-950 capitalize mb-4 font-bold'>class schedule</p>
        
         <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Search teacher..."
           
            className="input-style w-64 px-2 py-1 rounded-full border border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black"
          />
        </div>
      <form className="bg-white p-4 rounded shadow mb-6 ">
        
        <div className='flex items-center gap-48 mb-4'>
            <select
            name='timeSlot'
            className='input-style'
        >
            <option value="">Select Teacher's Section</option>
           {
                enrollment.map((en) => (
                    <option key={en.id} value={en.id}>
                    {en.full_name} -teaches- {en.course_name} -in Room- {en.room}
                    </option>
                ))
            }
        </select>
        <select
            name='day'
            className='input-style'
        >
            <option value="">Choose Day</option>
            <option value="Monday">Monday</option>
            <option value="Tuesday">Tuesday</option>
            <option value="Wednesday">Wednesday</option>
            <option value="Thursday">Thursday</option>
            <option value="Friday">Friday</option>
            <option value="Saturday">Saturday</option>
        </select>
        <select 
            name='timeSlot'
            className='input-style'
        >
            <option value="">Select Time Slot</option>
            <option value="slot one">slot one(1:45-3:45)</option>
            <option value="slot two">slot one(3:45-5:45)</option>
            <option value="slot three">slot one(8:30-10:00)</option>
            <option value="slot four">slot one(10:00-11:30)</option>

        </select>
        </div>
        <button
            type='submit'
            className='bg-blue-800 text-white rounded-lg p-2 hover:bg-blue-600'
        >
            Assign Teacher
        </button>
      </form>
      <div className='bg-white p-4 rounded shadow mb-6 '>
            <p className="font-semibold mb-3">Schedules</p>
            <div className="max-h-55 overflow-y-auto">
                <table className="w-full border">
                    <thead className="bg-blue-900 text-white">
                        <tr>
                        <th className="p-2">ID</th>
                        <th>Teacher Name</th>
                        <th>Day</th>
                        <th>Time Slot</th>
                        <th>Action</th>
                    </tr>
                    </thead>

                </table>
            </div>
      </div>
    </div>
  )
}
