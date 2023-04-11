import React from 'react'
import {  metext,frontend,backend } from '../util/aboututils';
import Icons from './Icons' 
import { Link } from 'rakkasjs';


interface introProps {

}

 const About: React.FC<introProps> = ({}) => {
  


    return (
    <div className="mt-[60px] min-h-screen max-w-[99%] flex flex-col bg-slate-800 font-serif">
  


     <div  className="flex-center w-full  flex-col justify-evenly ">  

     <div  className="flex w-full  h-full flex-col md:flex-row justify-evenly ">  

      <div className="flex-center flex-col  h-full w-[95%] shadow hover:shadow-lg 
      shadow-slate-300 p-4 m-2 gap-5 font-serif">




              <div className="p-5   flex flex-col text-slate-50 
              border shadow shadow-slate-400 rounded-lg  gap-1">

                <div className="text-3xl md:text-4xl text-slate-400 font-bold ">
                  About Me
                </div>
 
                <ul className=''>
                  <li>I am a passionate self-taught JavaScript/React developer .</li> 
                  <li>I have also briefly dabbled in C, Java, Kotlin, Python, and Go. </li> 
                  <li>I completed the ALX software engineering program
                  where we learned the basics of C, Python, and Linux.</li>
                </ul>
                <Link href="https://www.alxafrica.com/software-engineering-" >
                  <a target="_blank" className="text-green-400">
                    ALX software engineering program
                  </a></Link>

              </div>
     
          <ul className="p-5  flex flex-col border shadow shadow-slate-400 rounded-lg ">
                <div className="text-3xl md:text-4xl text-slate-400 font-bold ">
                  Ethos
                </div>
         {
           metext.map((item,index)=>{
             return(
               <li key={index}
              className="  text-slate-50 hover:text-green-300"> {"*"} {item}
               </li>
             )
           })
         }
    
        </ul>

      </div>




     </div>

    <div className="flex-center w-[90%] gap-2 flex-col md:flex-row justify-evenly ">

    <div className=" h-full w-full flex flex-col  justify-evenly 
    hover:shadow-lg p-4 border shadow shadow-slate-400 rounded-lg prose-sm"> 

      <div  className="text-2xl md:text-4xl text-slate-400 font-bold">
          Frontend
          </div>
          <ul  className="flex flex-wrap">
         {
           frontend.map((item,index)=>{
             return(
               <li key={index}
               className="text-sm border border-green-500  text-slate-50 m-1 p-1 
               rounded-lg">{item}</li>
             )
           })
         }

        </ul>
      </div>

      <div className="h-full w-full flex flex-col  
       hover:shadow-lg p-4 border shadow shadow-slate-400 rounded-lg prose-sm
      ">
        <div  className="h-full text-2xl md:text-4xl text-slate-400 font-bold">
          Backend 
          </div>
          <ul  className="flex flex-wrap mt-[5%]">
         {
           backend.map((item,index)=>{
             return(
               <li key={index}
               className="text-sm  border border-green-500  text-slate-50 m-1 p-1 
               rounded-lg"> {item}</li>
             )
           })
         }

        </ul>
     </div>

    </div>

    </div>
    <Icons/>
    </div> 
        );
}
export default About
