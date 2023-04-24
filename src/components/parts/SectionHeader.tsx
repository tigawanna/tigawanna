interface SectionHeaderProps {
heading:string
}

export function SectionHeader({heading}:SectionHeaderProps){
return (

        <h2 className="w-full text-2xl py-4 pl-5 md:text-4xl text-slate-400 font-bold 
            border-t border-t-green-500">
            {heading}
        </h2>

);
}
