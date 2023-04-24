import React from 'react'

import { Link } from 'rakkasjs';
import { projects_list } from '../util/projects';
import { GoodImage } from '../shared/GoodImage';


export interface Project {
title:string,
desc:string,
link:string,
previewlink:string,
tools:string[]
image:string
}

interface ProjectProps {
// fb_projects:Project[] | undefined
}

function Projects ({ }: ProjectProps){
// const localdata = local_projects as Project[]  

const projects=projects_list


return (
<div className="min-h-screen w-[100%] flex flex-col bg-slate-700 pl-4">
  <div className="flex flex-col">

  <div className="flex flex-col shadow-sm shadow-slate-300 p-4 ">
        <h2  className="text-3xl md:text-4xl text-slate-400 font-bold">
          Highlighted Projects
          </h2>
          <ul  className="flex  flex-wrap gap-3">
          {
           projects&&projects.map((item,index)=>{
             return(
               <li key={index} 
                 className="w-full lg:max-w-[40%] sm:w-[50%] md:w-[35%] lg:w-[25%]  
                 flex-grow p-2 flex flex-col items-center justify-center
                  border-2 border-green-500 rounded-xl shadow  shadow-green-300">
                 <div
                   className="w-full text-2xl md:text-xl text-green-300 opacity-1 font-bold p-1 m-1">
                   {item.name}
                 </div>
                 <div className="font-medium text-sm w-full h-full  flex flex-wrap ">

      
                   {/* <GoodImage
                    props={{ src: item.image,
                    className:"md:h-[40%] sm:w-auto object-cover aspect-square"}}
                   height="200px"
                   width="100px"
                   /> */}
                   <img
                   src={item.image}
                   alt={item.name}
                   className="w-[30%] h-auto object-fit aspect-square rounded-xl"
                   height='100px'
                   width='100px'
                   />
                   <div className="w-[70%] p-2 capitalize text-base font-sans ">
                   <div className="p-2  capitalize text-base font-sans ">
                   {item.description}
                   </div>

                     <div className="font-small text-sm w-fit max-w-[95%] 
                    flex  flex-wrap  gap-2 truncate rounded-lg">
                     {item.technologies.map((item, index) => {
                       return (<div key={index}
                         className="p-1 rounded-sm text-green-200  border border-green-400">
                         {item}</div>
                       )
                     })}
                   </div>
                   </div>

                   <div className=" font-medium w-full flex justify-between p-2  ">

                     <div className="h-5  border  rounded-lg p-1 hover:text-green-300 hover:underline">
                       <Link href={item?.hosted} target="_blank">live preview</Link>
                     </div>

                     <div className="h-5  border   rounded-lg p-1 hover:text-green-300 hover:underline">
                       <Link href={item.link} target="_blank">
                         github repository
                       </Link>
                     </div>
                   </div>

                   </div>

        
    

                </li>
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
