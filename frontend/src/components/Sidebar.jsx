import {React, } from 'react';
import { toast, ToastContainer } from "react-toastify";
import  Swal  from "sweetalert2";
import { Link, useNavigate } from "react-router-dom";
import { 
  HomeIcon, 
  UserGroupIcon, 
  AcademicCapIcon, 
  BookOpenIcon, 
  ArrowRightOnRectangleIcon 
} from "@heroicons/react/24/outline";
import  Logo  from "../assets/images.png";
export default function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
   Swal.fire({
    title: "Are you sure you want to logout?",
    text: "You will need to login again to access your account.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, logout!",
    cancelButtonText: "Cancel"
  }).then(async(result) => {
    if (result.isConfirmed) {
      toast.success("Logging out...");
         try {
        await fetch("http://localhost/sms/backend/controllers/logout.php", {
          method: "POST",
          credentials: "include"
        });

        setUser(null);      // clear React auth state

        // Give toast a small delay so user can see it
        setTimeout(() => navigate("/login"), 500);
      } catch (err) {
        console.error(err);
        navigate("/login");
      }
    }
    if (result.isDismissed) {
      toast.info("Logout cancelled");
      return;
    }
  });
}

  return (
    <div>
      <div className='pt-2 bg-gray-50 h-screen flex flex-col items-start pl-5'>
          <ToastContainer
            autoClose={1000}
          />
        <div className='flex items-center justify-center text-2xl font-bold text-blue-950 mb-14 mt-5 ml-5'>
            <img src={Logo} alt="school logo" className='w-10 h-10 rounded-full shadow shadow-2xl' />
            <p>SMS</p>
        </div>

        {/* Dashboard */}
        <Link to="/admin/dashboard">
          <div className="flex gap-2 mb-5 text-blue-950 font-semibold p-2 rounded-sm w-full 
          hover:bg-blue-950 hover:text-white cursor-pointer
          transform transition duration-300 hover:scale-105">
            <HomeIcon className="h-5 w-5" />
            <p>Dashboard</p>
          </div>
        </Link>

        {/* Students */}
        <Link to="/admin/students">
          <div className="flex gap-2 mb-5 text-blue-950 font-semibold p-2 rounded-sm w-full
          hover:bg-blue-950 hover:text-white cursor-pointer
          transform transition duration-300 hover:scale-105">
            <UserGroupIcon className="h-5 w-5" />
            <p>Students</p>
          </div>
        </Link>

        {/* Teachers */}
        <Link to="/admin/teachers">
          <div className="flex gap-2 mb-5 text-blue-950 font-semibold p-2 rounded-sm w-full
          hover:bg-blue-950 hover:text-white cursor-pointer
          transform transition duration-300 hover:scale-105">
            <AcademicCapIcon className="h-5 w-5" />
            <p>Teachers</p>
          </div>
        </Link>

        {/* Courses */}
        <Link to="/admin/courses">
          <div className="flex gap-2 mb-54 text-blue-950 font-semibold p-2 rounded-sm w-full
          hover:bg-blue-950 hover:text-white cursor-pointer
          transform transition duration-300 hover:scale-105">
            <BookOpenIcon className="h-5 w-5" />
            <p>Courses</p>
          </div>
        </Link>

        {/* Logout */}
        <div
          onClick={handleLogout}
          className="flex gap-2 mb-5 text-blue-950 font-semibold items-center p-2 rounded-sm w-full
          hover:bg-blue-950 hover:text-white cursor-pointer
          transform transition duration-300 hover:scale-105"
        >
          <ArrowRightOnRectangleIcon className="h-6 w-6" />
          <p>Logout</p>
        </div>

      </div>
    </div>
  )
}