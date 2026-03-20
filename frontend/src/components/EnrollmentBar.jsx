import React from 'react'
import { Link } from "react-router-dom";

export default function EnrollmentBar() {
  return (
    <div className='flex items-center justify-center bg-white text-black p-3 w-full h-20 gap-25'>
            <Link to={'/admin/enrollments/students'}>
                <div className='bg-blue-900 text-white font-bold w-40 p-2 h-10 rounded-2xl hover:bg-blue-800 transition transform hover:scale-105'>
                    <p className='text-center'>Enroll Students</p> 
                </div>
            </Link>
            <Link to={'/admin/enrollments/teachers'}>
                <div className='bg-blue-900 text-white font-bold w-40 p-2 h-10 rounded-2xl hover:bg-blue-800 transition transform hover:scale-105'>
                    <p className='text-center'>Enroll Teacher</p> 
                </div>
            </Link>
            <Link to={'/admin/enrollments/specific-enrollment'}>
                <div className='bg-blue-900 text-white font-bold w-52 p-2 h-10 rounded-2xl hover:bg-blue-800 transition transform hover:scale-105'>
                    <p className='text-center'>Enroll Specific Student</p> 
                </div>
            </Link>
            <Link to={'/admin/enrollments/slip-generator'}>
                <div className='bg-blue-900 text-white font-bold w-52 p-2 h-10 rounded-2xl hover:bg-blue-800 transition transform hover:scale-105'>
                    <p className='text-center'>Slip Generator</p> 
                </div>
            </Link>
    </div>
  )
}
