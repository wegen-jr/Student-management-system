import React from 'react'
import EnrollmentBar from "../components/EnrollmentBar";
import { Outlet } from "react-router-dom";
function EnrollmentLayout() {
  return (
    <div className='h-screen'>
        <div className='flex flex-col items-center justify-between h-20'>
            <EnrollmentBar/>
        </div>
        <div>
          <Outlet/>
        </div>
    </div>
  )
}

export default EnrollmentLayout
