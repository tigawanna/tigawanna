import Link from "next/link";
import { SectionHeader } from "../shared/SectionHeader";
import Image from "next/image";

interface introProps {

}

function About ({ }:introProps){


 return (
   <div className=" min-h-screen max-w-[99%] flex flex-col w-full">
     <div className="w-full h-full min-h-screen  flex flex-col justify-center relative">
       <SectionHeader heading="About Me" />
       <img src="/blobby.svg" height={1000} width={1000} className="h-screen w-full object-fit  " />
       <div className="w-full h-full flex  absolute  top-0 left-0 right-0 p-5 ">
         <div className="w-full  flex justify-center items-center flex-col gap-7">
           {/* <h2 className="text-4xl font-bold "> About Me</h2> */}

           <div className="flex flex-col items-center  md:w-[60%] gap-7">
             {/* bio */}
             <div className=" text-slate-400  text-lg text-center">
               I'm a Full stack Javascript/Typescript Web Developer with over 3 years of experience
               of building with React,vite, nextjs and nodejs.
             </div>
             <div className=" text-slate-400  text-lg text-center">
               Went through computer science foundations and intor to backend using python
               @ALX_africa, before exploring Javascript and Typescript
             </div>
             <img src="/alx.png" className="max-h-[70vh] h-[70%]" />
           </div>
         </div>
       </div>
     </div>
   </div>
 );
}
export default About
