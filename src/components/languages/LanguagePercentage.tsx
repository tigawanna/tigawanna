import { LanguagePercentage } from "./helpers";


interface LanguagePercentageProps {
    prop:LanguagePercentage
}

export function LanguagePercentageComponent({ prop }: LanguagePercentageProps){



    const fillerStyles:React.CSSProperties = {
        height: '100%',
        width: `${prop.percentage}%`,
        borderRadius:70,
        // backgroundColor:prop.color,
        border:`3px solid ${prop.color}`,
        boxShadow: `0 5 10px ${prop.color}`,
        textAlign: 'right',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding:2,

    }



if(prop.percentage < 1){
    return null
}

return (
    <div 
       style={fillerStyles}
        className="md:max-w-[40%] md:min-w-[10%] min-w-fit ">
        <span className="flex px-2 items-center justify-center rounded-2xl"></span>
        <div className="font-mono px-1 min-w-fit  
        truncate rounded-lg flex items-end justify-center">
                {`${prop.name} ${prop.percentage}%`}
           </div>
        </div>
   
  
);
}
