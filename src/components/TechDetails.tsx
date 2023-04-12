import { useSSQ } from "rakkasjs";
import { ErrorOutput } from "../shared/ErrorOutput";
import { ProgressBar } from "./ProgressBar";
import { getViewerLangs,ViewerLang } from "../util/gql";
import { getMostFrequentLanguages } from "../util/helper";


interface TechDetailsProps {

}

export function TechDetails({}:TechDetailsProps){
    
    const { data, dataUpdatedAt, } = useSSQ<ViewerLang>(() => {
        return getViewerLangs()
    }
    )
    
// console.log("data==== ", data)

if (("message" &&"documentation_url") in data.data){
    return <ErrorOutput error={data.data}/>
}


const language_percentages = getMostFrequentLanguages(data.data.viewer.repositories)



return (
 <div className='w-full h-full flex flex-wrap items-center justify-center gap-2'>
{
    language_percentages.map((lang, index) => {
        return <ProgressBar prop={lang}  key={lang.name}/>
    })
}
</div>
);
}
