import React from 'react'
import Logo from "../assets/images.png";
import profile from "../assets/person-circle.svg";
function Navbar() {
  return (
    <div className='flex items-center justify-between  bg-white h-10 p-2 font-sans rounded-md shadow-lg'>
    <div className='flex items-center justify-start text-black  '>
        <img src={Logo} alt="logo" className='h-8 w-8 rounded-full mx-1' />
        <h1>SMS</h1>
    </div>
    <div className='flex items-center justify-start font-sans mr-2'>
          <form action="" method='post'>
              <button className='bg-blue-500 text-white font-bold px-2 rounded-lg hover:bg-blue-700'> Log out</button>
          </form>
          <img src={profile} alt="profile" className='h-8 w-8 rounded-full mx-1' />
    </div>
    </div>
  )
}

export default Navbar
