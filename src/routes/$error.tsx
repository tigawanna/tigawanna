

interface $errorProps {

}

export default function RakkasError({}:$errorProps){
return (
 <div className='w-full h-full flex items-center justify-center '>
    
    <h2 className="min-h-[50%] min-w-[50%] 
    flex items-center justify-center text-red-900 border border-red-900 bg-red-200 rounded-xl">
            Error happened 
    </h2>

 </div>
);
}
