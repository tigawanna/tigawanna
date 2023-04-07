import React from 'react'
import {  metext,frontend,backend } from '../util/aboututils';
import Icons from './Icons' 
import { Link } from 'rakkasjs';


interface introProps {

}

 const About: React.FC<introProps> = ({}) => {
  


    return (
    <div className="mt-[60px] min-h-screen max-w-[99%] flex flex-col bg-slate-800">
  


     <div  className="flex-center w-full  flex-col justify-evenly ">  

     <div  className="flex w-full  h-full flex-col md:flex-row justify-evenly ">  

      <div className="flex-center flex-col h-full w-[95%] shadow hover:shadow-lg shadow-slate-300 
      hover:shadow-green-300 p-4 m-2 ">
      
       <div  className="text-lg w-[90%] md:w-[70%]  flex-col-center text-white">
        Self taught and learned most of my skills by building stuff also currently going through
        <br/>
         <Link href="https://www.alxafrica.com/software-engineering-" >
          <a target="_blank" className="text-green-400">
             ALX software program
            </a></Link>
           </div>
       <br/>
     
        <div  className="text-3xl md:text-4xl text-slate-400 font-bold ">
          Ethos
        </div>
        <ul className="flex flex-col m-[5%]">
         {
           metext.map((item,index)=>{
             return(
               <li key={index}
              className="text-base md:text-lg  font-mono text-slate-50 hover:text-green-300"> {"*"} {item}
               </li>
             )
           })
         }
         ...
        </ul>
      </div>




     </div>

    <div className="flex-center w-full  flex-col md:flex-row justify-evenly ">

    <div className="flex w-[95%] flex-col  justify-evenly  shadow hover:shadow-lg 
    shadow-slate-300 hover:shadow-green-300 p-4 m-1"> 

      <div  className="text-2xl md:text-4xl text-slate-400 font-bold">
          Frontend
          </div>
          <ul  className="flex flex-wrap">
         {
           frontend.map((item,index)=>{
             return(
               <li key={index}
               className="text-sm md:text-base border border-green-500  text-slate-50 m-1 p-1 
               font-mono rounded-sm">{item}</li>
             )
           })
         }

        </ul>
      </div>

      <div className="flex flex-col w-[95%] shadow hover:shadow-lg  shadow-slate-300 
      hover:shadow-green-300 p-4 m-1 rounded-lg">
        <div  className="h-full text-2xl md:text-4xl text-slate-400 font-bold">
          Backend 
          </div>
          <ul  className="flex flex-wrap mt-[5%]">
         {
           backend.map((item,index)=>{
             return(
               <li key={index}
               className="text-sm md:text-base border border-green-500  text-slate-50 m-1 p-1 
               font-mono"> {item}</li>
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
