import { LanguagePercentage } from "../util/helper";

interface ProgressBarProps {
prop:LanguagePercentage
}

export function ProgressBar({prop}:ProgressBarProps){



    const fillerStyles:React.CSSProperties = {
        height: '100%',
        width: `${prop.percentage}%`,
        borderRadius:70,
        backgroundColor:prop.color,
        textAlign: 'right',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding:2
    }


    const is_tiny = prop.name.length > 4 && prop.percentage < 3
    
    function calcNameLength(){
        // if(is_tiny){
        //     return prop.name.slice(0,3) + "..."
        // }
        return prop.name
    }
if(prop.percentage<1){
    return null
}

return (
    <div 
       style={fillerStyles}
       className="md:max-w-[40%] md:min-w-[10%] min-w-fit"
       >
        <span className="flex px-2 items-center justify-center rounded-2xl"></span>
            <div className="px-1 min-w-fit text-sm bg-slate-900 bg-opacity-70 truncate rounded-lg flex items-end justify-center">
                {`${calcNameLength()} ${prop.percentage}%`}
           </div>
        </div>
   
  
);
}
