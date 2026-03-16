import React from 'react'
import telegram from "../assets/telegram.svg";
import github from "../assets/github.svg";
function Footer() {
  return (
    <div className='flex items-center justify-between  bg-white h-15 p-2 font-mono rounded-md shadow-lg'>
         <div className='flex items-center justify-start text-black  '>
                <p>&copy; 2026 all right reserved</p>
         </div>   
             <div className='flex items-center justify-start font-sans mr-2 gap-2'>
                <a href="https://t.me/zarathustra0666"><img src={telegram} alt="telegram" className='w-7 h-7 '/></a>
                <a href="https://github.com/wegen-jr"><img src={github} alt="github" className='w-6 h-6 '/></a>
             </div>
    </div>
  )
}

export default Footer
