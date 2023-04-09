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
        <div  className="text-3xl md:text-4xl text-slate-400 font-bold">
          Projects
          </div>
          <ul  className="flex-center flex-wrap ">
          {
           projects&&projects.map((item,index)=>{
             return(
               <li key={index} 
               className="footer-projects-li">

                 <div className="font-medium text-sm w-full flex flex-col">

                   <div 
                    className="text-2xl md:text-xl text-green-300 opacacity-1 font-bold
                     overflow-hidden p-1 m-1">
                   {item.name}
                   </div>
                   <GoodImage
                   props={{src:item.image}}
                   height="700px"
                   width="500px"
                   />
                   {/* <img
                    src={item.image}
                    className={'h-full w-full object-cover'}
                    /> */}
                   <div className="text-base  my-2">
                   {item.description}
                   </div>
                   </div>
                   <div className="font-small text-sm w-full flex-center flex-wrap  ">
                    {item.technologies.map((item,index)=>{
                      return(<div key={index} 
                      className="p-[2px] m-[2px] rounded-sm text-green-200 bg-slate-900 ">
                        {item}</div>
                      )
                    })}
                   </div>
                   <div className="font-medium text-sm w-full flex justify-between ">
         
                   <div className="bg-slate-800 shadow-md shadow-white hover:shadow-green-300 rounded-sm p-1 m-1"> 
                   <Link href={item?.hosted}>
                   <a target="_blank">live preview</a>
                   </Link>
                   </div>    

                   <div className="bg-slate-800 shadow-md shadow-white hover:shadow-green-300 rounded-sm p-1 m-1"> 
                   <Link href={item.link}>
                   <a target="_blank">source code</a>
                   </Link>
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
