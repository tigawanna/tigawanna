import React from 'react'
import { local_projects } from '../util/aboututils';
import { useRouter } from 'next/router';
import Link from 'next/link'
import {animate, motion} from 'framer-motion'
import Image, { StaticImageData } from 'next/image'



export interface Project {
title:string,
desc:string,
link:string,
previewlink:string,
image:StaticImageData,
tools:string[]
}
interface footerProps {
fb_projects:Project[] | undefined
}

const Projects: React.FC<footerProps> = ({fb_projects}) => {
const localdata = local_projects as Project[]  

const projects=fb_projects&&fb_projects.length>0?fb_projects:localdata;

const router = useRouter();
return (
<div className="min-h-screen w-[100%] flex flex-col bg-slate-700 pl-4">
  <div className="flex flex-col">

  <div className="flex flex-col shadow-sm shadow-slate-300 p-4 ">
        <div  className="text-3xl md:text-4xl text-slate-400 font-bold">
          Projects
          </div>
          <ul  className="flex-center flex-wrap ">
          {
           projects&&projects.map((item,index)=>{
             return(
               <motion.li
               initial={{
                y:100,
                opacity:0.1
              }}
               whileInView={{
                 opacity:1,
                 y:0,
                 x:0
               }} 
               transition={{
                 type:"spring",
                 stiffness:30
               }}
          
               key={index} 
               className="footer-projects-li">

                 <div className="font-medium text-sm w-full flex flex-col">

                   <div 
                    className="text-2xl md:text-xl text-green-300 opacacity-1 font-bold
                     overflow-hidden p-1 m-1">
                   {item.title}
                   </div>
                   <Image
                    src={item.image}
                    
                    className={'h-full w-full object-cover'}
                    />
                   <div className="text-sm my-2">
                   {item.desc}
                   </div>
                   </div>
                   <div className="font-small text-sm w-full flex-center flex-wrap  ">
                    {item.tools.map((item,index)=>{
                      return(<div key={index} 
                      className="p-[2px] m-[2px] rounded-sm text-green-200 bg-slate-900 ">
                        {item}</div>
                      )
                    })}
                   </div>
                   <div className="font-medium text-sm w-full flex justify-between ">
         
                   <div className="bg-slate-800 shadow-md shadow-white hover:shadow-green-300 rounded-sm p-1 m-1"> 
                   <Link href={item?.previewlink}>
                   <a target="_blank">live preview</a>
                   </Link>
                   </div>    

                   <div className="bg-slate-800 shadow-md shadow-white hover:shadow-green-300 rounded-sm p-1 m-1"> 
                   <Link href={item.link}>
                   <a target="_blank">source code</a>
                   </Link>
                   </div>  
                   </div>

                </motion.li>
             )
           })
         }

        </ul>
      </div>
  </div>
</div>
);
}

export default Projects
