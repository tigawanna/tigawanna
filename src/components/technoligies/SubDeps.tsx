interface SubDepsProps {
sub_dep:string
}

export function SubDeps({sub_dep}:SubDepsProps){
return (
 <div className='max-w-[30%] flex items-center justify-center 
    border border-green-400 rounded-lg text-sm truncate'>
        {sub_dep}
 </div>
);
}
