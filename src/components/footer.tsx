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
            Github:<Link href="https://github.com/tigawanna"
            ><a target="_blank" className="text-green-400">tigawanna</a></Link>
        </div>
        <div className='my-2 md:my-0 text-sm md:text-lg text-slate-300 font-mono'>
            Linkden:
            <Link href="https://linkedin.com/in/dennis-kinuthia"
            ><a target="_blank" className="text-green-400">dennis kinuthia</a></Link>
        </div>

        <div className='my-2 md:my-0 text-sm md:text-lg text-slate-300 font-mono'>
            Articles:
            <Link href="https://dev.to/tigawanna"
            ><a target="_blank" className="text-green-400">tigawanna</a></Link>
        </div>
    </footer>
);
}
