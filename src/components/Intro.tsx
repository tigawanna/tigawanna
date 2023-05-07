"use client"
import Image from "next/image";
import { TypeAnimation } from 'react-type-animation';
interface introProps {}

export default function Intro({}:introProps){
  return (
    <div className="p-5 flex h-full min-h-[90vh] w-full  flex-col justify-center items-center">
      <div className="text-xl font-bold w-full lg:w-[95%] absolute top-[5%] left-[5%] ">
        Hi there, am
      </div>

      <div className="w-full lg:w-[95%] flex flex-col md:flex-row justify-center items-center gap-5">
      <div className="lg:max-w-[60%]">

        <h2 className="  text-7xl md:text-9xl  animate-text 
        bg-gradient-to-r from-teal-500 via-purple-500 to-orange-700 bg-clip-text text-transparent font-black
        ">
          Dennis Kinuthia
        </h2>

       <div className="font-sarif mt-[30px] text-2xl font-bold  md:text-6xl
 
        bg-gradient-to-r from-blue-500 via-green-500 to-purple-500 bg-clip-text text-transparent 
       ">
          <TypeAnimation
            cursor={true}
            sequence={['Javascript','Typescript ','React Developer']}
            wrapper="h1"
            className=""

          />
        </div>
        </div>

      
          <div className='w-[90%] lg:w-[30%]  flex justify-center p-2'>
            <Image
              src="/github.jpg"
              alt="Dennis Kinuthia"
               className="rounded-2xl aspect-square w-[100%] shadow shadow-accent "
              width={300}
              height={300}
              priority
            />
          </div>
   

      </div>
  </div>

  )
}


