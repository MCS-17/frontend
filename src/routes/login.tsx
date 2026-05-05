import { createFileRoute } from '@tanstack/react-router'
import { motion } from "motion/react"

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function LoginPage() {
  return (
    <main className="bg-white min-h-dvh w-full flex justify-center items-center">
      <div className="flex flex-col items-center h-auto w-full">
        <div className='flex flex-col items-center pb-5'>
          <div className='text-black text-3xl font-semibold'>MUMHPC</div>
          <div className='text-gray-400 text-lg font-semibold'>Student HPC Portal</div>
        </div>
        <div className='flex flex-col items-center w-full space-y-5'>
          <div>
            <div className='text-gray-400 text-lg'>Email</div>
            <div className="w-100 h-12 border-gray-200 border-2 rounded-md text-black text-lg focus-within:border-amber-400 focus-within:ring-1 focus-within:ring-amber-400 transition-colors">
              <input className="w-full h-12 px-5 bg-transparent focus:outline-none text-sm" placeholder="xxxxxxxx@student.monash.edu"></input>
            </div>
          </div>
          <div className=''>
            <div className='text-gray-400 text-lg'>Password</div>
            <div className="w-100 h-12 border-gray-200 border-2 rounded-md text-black text-lg focus-within:border-amber-400 focus-within:ring-1 focus-within:ring-amber-400 transition-colors">
              <input className="w-full h-12 px-5 bg-transparent focus:outline-none text-sm" type="password"></input>
            </div>
          </div>
        </div>
        <hr className="bg-gray-200 w-100 h-1 mt-8 my-5"/>
        <div className='text-black pb-5'>
          First time user? <a className='text-amber-400 underline hover:text-amber-500 cursor-pointer'>Sign Up</a>
        </div>
        <motion.button
          className="bg-amber-400 w-100 h-12 rounded-lg text-black font-semibold text-lg flex justify-center items-center"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          >
          Log In
        </motion.button>
        <div>
        </div>
      </div>
    </main>
  )
}
