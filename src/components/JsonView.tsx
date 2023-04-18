import { useQuery } from "rakkasjs";
import JSONs from '../../user_packages.json'
interface JsonViewProps {

}

export function JsonView({}:JsonViewProps){
    const query  = useQuery(
       "json",
       ()=>{
           return JSONs
       }
    )

const data = query.data
console.log("jsons  === data ===== ",data)
return (
 <div className='w-full h-full flex flex-col gap-1 p-1 items-center justify-center'>
    { 
    data.map((item,index)=>{
        return(
            <div className="w-full p-1 border-2 rounded-lg border-red-400 ">
                <div className="border-yellow-300 border-2 rounded-full ">
                    {index+1}
                </div>
                <div className="line-clamp-3 w-[100%]">
                    {JSON.stringify(item)}
                </div>
   
            </div>
        )
    })}
 </div>
);
}
