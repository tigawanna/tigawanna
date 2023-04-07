import React from 'react'
import {
    SiApollographql,
    SiGraphql,
    SiReact,
    SiFirebase,
    SiPython,
    SiJavascript,
    SiTypescript,
    SiTailwindcss,
    SiKotlin,
    SiNodedotjs,
    SiMongodb,
    SiLinux,
    SiFlutter,
    SiNextdotjs,
    SiPostgresql,
    SiRedis
}from 'react-icons/si'
import { IconContext } from "react-icons/lib";


interface IconsProps {

}

 const Icons: React.FC<IconsProps> = ({}) => {
return (
 <div 
  className="max-w-[95%] h-fit flex-center flex-wrap m-5">
    <IconContext.Provider value={{ size: "40px",color:"#7CFC00", className: "m-2" }} >
     <SiJavascript/>
     <SiTypescript/>
     <SiKotlin/>
     <SiPython/>        
     <SiReact/>
     <SiTailwindcss/>
     <SiApollographql/>
     <SiGraphql/>
     <SiFirebase/>
     <SiNodedotjs/>
     <SiMongodb/>
     <SiLinux/>
     <SiFlutter/>
     <SiNextdotjs/>
     <SiPostgresql/>
     <SiRedis/>
</IconContext.Provider>
 </div>
);
}
export default Icons
