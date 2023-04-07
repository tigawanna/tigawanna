import React from 'react'




interface introProps {}

export const Intro: React.FC<introProps> = ({}) => {
  return (
    <div className="mt-[60px] flex min-h-screen w-[100%] flex-col bg-slate-700 pl-4">
      <div className="font-mono text-2xl font-bold text-green-300 md:text-xl ">
        Hi there, am
      </div>
      <div className="mt-[100px] flex flex-col">

        <div className="font-sarif mt-[5%] text-6xl font-bold text-green-400 md:text-8xl">
          Dennis Kinuthia
        </div>

        <div className="font-sarif mt-[30px] text-3xl font-bold text-slate-200 md:text-6xl">
          {/* <TypeAnimation
            cursor={true}
            sequence={['African web developer and designer']}
            wrapper="h1"
            className="text-green-300"
          /> */}
        </div>

        <div className="font-sarif mt-[40px] text-base  text-green-200 md:w-[40%] md:text-lg">

         ❤️ React 
         ❤️ tailwindcss
         ❤️ react-query
         ❤️ GraphQL
        </div>

        



      </div>
    </div>
  )
}
export default Intro
