import { createFileRoute } from '@tanstack/react-router'
import { motion } from "motion/react"

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function LoginPage() {
  return (
    <main className="bg-white min-h-screen w-full flex justify-center items-center">
      <div className="flex flex-col items-center h-100 w-full">
        <div className='flex flex-col items-center pb-5'>
          <div className='text-black text-3xl font-semibold'>MUMHPC</div>
          <div className='text-gray-400 text-lg font-semibold'>Student HPC Portal</div>
        </div>
        <div className='flex flex-col items-center w-full space-y-5'>
          <div>
            <div className='text-gray-400 text-lg'>Email</div>
            <div className="w-100 h-12 border-gray-200 border-2 rounded-md text-black text-lg">
              <input className="w-full h-12 px-5" placeholder="xxxxxxxx@student.monash.edu"></input>
            </div>
          </div>
          <div className=''>
            <div className='text-gray-400 text-lg'>Password</div>
            <div className="w-100 h-12 border-gray-200 border-2 rounded-md text-black text-lg">
              <input className="w-full h-12 px-5" type="password"></input>
            </div>
          </div>
        </div>
        <hr className="bg-gray-200 w-100 h-1 my-12"/>
        <div>

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
