import { ErrorBoundary, Head, LayoutProps, StyledLink } from "rakkasjs";
import { MainFooter } from "../components/shared/Footer";
import { RakkasErrorBoundary } from "../shared/RakkasErrorBoundary";
import "../styles/tailwind.css";


export default function MainLayout({ children }: LayoutProps) {
    return (
        <div className="w-full">
            <Head title="Real estates">
                <html lang="en" />
                <link rel="icon" type="image/x-icon" href="/icon.svg" />
            </Head>
            
        <ErrorBoundary fallbackRender={({ error, resetErrorBoundary }) =>(
         <RakkasErrorBoundary error={error} resetErrorBoundary={resetErrorBoundary}/>)}>
   
            <hr />
            <div className="w-full">{children}</div>
            <hr />
            <MainFooter/>
       </ErrorBoundary>

        </div>
    );
}
