import { Link } from 'rakkasjs';
import { SectionHeader } from '../shared/SectionHeader';
import { projects_list } from './helpers';


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
<div className="min-h-screen w-[100%] flex flex-col items-center justify-center  p-3 text-slate-300">
  <SectionHeader heading='Highlighted projects'/>
  
  <div className="w-full p-2 flex flex-col items-center justify-center">
    <div className="w-full flex flex-col items-center justify-center shadow-sm shadow-slate-300 p-2 ">

          <ul  className="flex  flex-wrap items-center justify-center gap-3">
          {
           projects&&projects.map((item,index)=>{
             return(
               <li key={index} 
                 className="w-full lg:max-w-[40%] sm:w-[50%] md:w-[35%] lg:w-[25%]  
                 flex-grow p-2 flex flex-col items-center justify-center 
                  border-2 border-green-500 rounded-xl shadow  shadow-green-300 hover:brightness-150">
                 <div
                   className="w-full text-xl text-green-300 opacity-1 font-bold p-1 m-1">
                   {item.name}
                 </div>

                 <div className="text-sm w-full h-full  flex flex-col md:flex-row">
                <img
                   src={item.image}
                   alt={item.name}
                   className="w-full md:w-[30%] h-auto object-fit aspect-square rounded-xl"
                   height='100px'
                   width='100px'
                   />
                   <div className="w-full md:w-[70%] p-2 capitalize text-base font-sans ">

                   <div className="p-2  capitalize text-base font-sans ">
                   {item.description}
                   </div>

                    
                    <div className="font-small text-sm w-fit max-w-[95%] 
                    flex  flex-wrap  gap-2 truncate rounded-lg">
                     {item.technologies.map((item, index) => {
                       return (<div key={index}
                         className="px-1 rounded-sm text-green-200  border border-green-400 text-xs md:text-sm">
                         {item}</div>
                       )
                     })}
                   </div>

                   </div>

      

                   </div>

                     <div className=" font-medium w-full flex justify-between p-2  text-sm">

                     <div className="border-b  rounded-lg p-1 hover:text-green-300 hover:underline">
                       <Link href={item?.hosted} target="_blank">live preview</Link>
                     </div>

                     <div className="border-b   rounded-lg p-1 hover:text-green-300 hover:underline">
                       <Link href={item.link} target="_blank">
                         github repository
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