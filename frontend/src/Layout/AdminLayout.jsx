import React from 'react'
import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router-dom";

export default function AdminLayout() {
  return (
    <div className='flex h-screen'>
      <div className='w-48'>
        <Sidebar/>
      </div>

      <div className='flex-1 overflow-y-auto'>
        <Outlet/>
      </div>
    </div>
  )
}