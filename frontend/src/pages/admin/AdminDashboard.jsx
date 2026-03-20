import {React, useState,useEffect} from 'react'
import { MagnifyingGlassIcon, SignalIcon,  ArrowPathIcon, UserPlusIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import { BarChart, PieChart, Tooltip, XAxis,YAxis, Bar, ResponsiveContainer, CartesianGrid, Pie, Legend, Cell } from "recharts";
export default function AdminDashboard() {
    const [genderData, setGenderData] = useState([]);
    const [totalStudents, setTotalStudents] = useState(0);
    const [totalTeachers, setTotalTeachers] = useState(0);
    const [totalCourses, setTotalCourses] = useState(0);
    const [totalSections, setTotalSections] = useState(0);
    const COLORS = ['#1e3a8a', '#3b82f6', '#93c5fd'];
    useEffect(() => {
        fetch('http://localhost/sms/backend/admin/studentStats.php',{
            credentials: 'include' 
        })
        .then(res => res.json())
        .then(data => {
            // CONVERT STRINGS TO NUMBERS HERE
            const formattedGender = data.genderStats.map(item => ({
                gender: item.gender,
                total: parseInt(item.total) // Explicitly convert to integer
            }));

            
            setGenderData(formattedGender);
            // setDepartmentData(formattedDept);
            setTotalStudents(data.totalStudents);
            setTotalTeachers(data.totalTeachers);
            setTotalCourses(data.totalCourses);
            setTotalSections(data.totalSections);
        })
        .catch(err => console.error(err));
    }, []);

    const searcheResult=async (e)=>{
        e.preventDefault();

    }
    
    
  return (
    <div >
        <div>
                <div className='h-70 bg-gradient-to-b from-sky-950 via-sky-900 to-white'>    
                    <div className='flex justify-between pt-4'>
                        <form onSubmit={searcheResult}>
                            <div className='relative ml-3'>
                                <button className="absolute inset-y-0 left-0 pl-6 flex items-center hover:cursor-pointer">
                                    <MagnifyingGlassIcon className='h-5 h-5 text-white'/>
                                </button>
                                <input type="text" className='w-sm h-8 px-10 bg-gray-300/40 m-3 rounded-full text-white' placeholder='search...' />
                            </div>
                        </form>
                        <div>
                            <SignalIcon className='mr-6 mt-3 h-5 h-5 text-white'/>
                                <span className="absolute top-9 right-7 w-2 h-1 bg-red-500 rounded-full"></span>
                        </div>
                    </div>
                    <div>
                        <p className='text-2xl font-semibold text-white mx-6'>Acadamic Overview</p>
                    </div>
                    <div className='flex p-3'>
                            <div className='w-58 h-30 bg-white/30 px-5 py-2 mx-3 border border-white rounded-xl shadow shadow-lg'>
                                    <p className='text-gray-950'>total students</p>
                                    <p className='text-3xl font-bold text-black'>{totalStudents}</p>
                            </div>
                            <div className='w-58 h-30 bg-white/30 px-5 py-2 mx-3 border border-white rounded-xl shadow shadow-lg'>
                                <p className='text-gray-950'>total teachers</p>
                                <p className='text-3xl font-bold text-black'>{totalTeachers}</p>
                            </div>
                            <div className='w-58 h-30 bg-white/30 px-5 py-2 mx-3 border border-white rounded-xl shadow shadow-lg'>
                                <p className='text-gray-950'>total Courses</p>
                                <p className='text-3xl font-bold text-black'>{totalCourses}</p>
                            </div>
                            <div className='w-94 h-30 bg-white/30 px-5 py-2 mx-3 border border-white rounded-xl shadow shadow-lg'>
                                <p className='text-gray-950'>total class room</p>
                                <p className='text-3xl font-bold text-black'>{totalSections}</p>
                            </div>
                    </div>
                    <div>
                    </div>
                </div>
                <div className="h-84 w-full bg-gray-100 flex p-2">
                        <div className="flex-1"> 
                            <p className='text-3xl text-center font-bold font-sans text-sky-950 capitalize m-2'>total statistics</p>
                            <div className="flex items-center justify-around h-full"> 

                            {/* Pie Chart Wrapper */}
                            <div className="w-1/3 h-full"> {/* Give the wrapper 50% width */}
                                <p className='text-center text-xl text-sky-950 capitalize  '>student statistics</p>
                                <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie
                                    data={genderData}
                                    dataKey="total"
                                    nameKey="gender"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    label
                                    >
                                    {genderData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                </div>
                       
                       <div className="w-102 px-4 mr-6 bg-gray-50 flex flex-col shadow-xl rounded-xl border-gray-200 border-2">
                            <div className="text-blue-950">
                                <p className="font-bold text-2xl text-center">Quick Actions</p>

                                {/* Register Student */}
                                <Link to="/admin/student-registration">
                                <div className="flex items-center gap-3 border border-gray-200 shadow-lg p-2 rounded-xl font-semibold mb-3 cursor-pointer transform transition duration-300 hover:scale-105 hover:bg-blue-50">
                                    <UserPlusIcon className="bg-blue-950/10 w-10 h-10 rounded-full p-2" />
                                    <p>Register new student</p>
                                </div>
                                </Link>

                                {/* Update Student */}
                                <Link to="/admin/update-student">
                                <div className="flex items-center gap-3 border border-gray-200 shadow-lg p-2 rounded-xl font-semibold mb-3 cursor-pointer transform transition duration-300 hover:scale-105 hover:bg-blue-50">
                                    <ArrowPathIcon className="bg-blue-950/10 w-10 h-10 rounded-full p-2" />
                                    <p>Update student's Information</p>
                                </div>
                                </Link>

                                {/* Register Teacher */}
                                <Link to="/admin/teacher-registration">
                                <div className="flex items-center gap-3 border border-gray-200 shadow-lg p-2 rounded-xl font-semibold mb-3 cursor-pointer transform transition duration-300 hover:scale-105 hover:bg-blue-50">
                                    <UserPlusIcon className="bg-blue-950/10 w-10 h-10 rounded-full p-2" />
                                    <p>Register new Teacher</p>
                                </div>
                                </Link>

                                {/* Update Teacher */}
                                <Link to="/admin/update-teacher">
                                <div className="flex items-center gap-3 border border-gray-200 shadow-lg p-2 rounded-xl font-semibold mb-3 cursor-pointer transform transition duration-300 hover:scale-105 hover:bg-blue-50">
                                    <ArrowPathIcon className="bg-blue-950/10 w-10 h-10 rounded-full p-2" />
                                    <p>Update teacher's Information</p>
                                </div>
                                </Link>

                            </div>
                            </div>
                </div>
        </div>
    </div>
  )
}
