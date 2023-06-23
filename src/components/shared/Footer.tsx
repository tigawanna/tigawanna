
import { ContactLinks } from "./ContactLinks";


interface footerProps {

}

export function MainFooter({}:footerProps){
return (
    <footer className="w-full flex  items-center justify-center border-t
     border-t-green-500 p-5 bg-green-800 bg-opacity-25 gap-2">
        <div className=' text-slate-300 font-bold text-lg'>
            Contact me
        </div>
        <ContactLinks size={20}/>
    </footer>
);
}
