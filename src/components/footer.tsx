import { Link } from "rakkasjs";

interface footerProps {

}

export function MainFooter({}:footerProps){
return (
    <footer className="index-footer">
        <div className='text-base md:text-lg text-slate-300 font-bold'>
            Contact me
        </div>
        <div className='my-2 md:my-0 text-sm md:text-lg text-slate-300 font-mono'>
            Email: denniskinuthiaw@gmail.com
        </div>
        <div className='my-2 md:my-0 text-sm md:text-lg text-slate-300 font-mono'>
            Github:
            <Link href="https://github.com/tigawanna" target="_blank" className="text-green-400">tigawanna</Link>
        </div>
        <div className='my-2 md:my-0 text-sm md:text-lg text-slate-300 font-mono'>
            Linkden:
            <Link href="https://linkedin.com/in/dennis-kinuthia"target="_blank" className="text-green-400">Dennis kinuthia</Link>
        </div>

        <div className='my-2 md:my-0 text-sm md:text-lg text-slate-300 font-mono'>
            Articles: 
            <Link href="https://dev.to/tigawanna"target="_blank" className="text-green-400">tigawanna</Link>
        </div>
    </footer>
);
}
