import { useSSQ } from "rakkasjs";
import { ErrorOutput } from "../shared/ErrorOutput";
import { ProgressBar } from "./ProgressBar";
import { getViewerLangs,ViewerLang } from "../util/gql";
import { getMostFrequentLanguages } from "../util/helper";



interface TechDetailsProps {

}

export function TechDetails({}:TechDetailsProps){
    
//     const { data, dataUpdatedAt, } = useSSQ<ViewerLang>(() => {
//         return getViewerLangs()
//     },
//     {

//     }
//     )


//     console.log("data==== ", data)


// if (("message" &&"documentation_url") in data.data){
//     return <ErrorOutput error={data.data}/>
// }


// const language_percentages = getMostFrequentLanguages(data.data.viewer.repositories)

// groupPackages()

return (
<div className='w-full h-full flex flex-col items-center justify-center'>
{/* <div className='w-full h-full flex flex-wrap items-center justify-center gap-2'>
<h3 className="w-full pl-10 text-lg text-green-300  ">Most used languages in my Github projects</h3>
{
    language_percentages.map((lang, index) => {
        return <ProgressBar prop={lang}  key={lang.name}/>
    })
}
</div> */}
</div>
);
}
