import { ErrorBoundary, LayoutProps, StyledLink } from "rakkasjs";
import { MainFooter } from "../components/footer";
import { RakkasErrorBoundary } from "../shared/RakkasErrorBoundary";
import "../styles/tailwind.css";


export default function MainLayout({ children }: LayoutProps) {
    return (
        <div>
        <ErrorBoundary
          fallbackRender={({ error, resetErrorBoundary }) =>(
         <RakkasErrorBoundary error={error} resetErrorBoundary={resetErrorBoundary}/>)}>
            <hr />
            <div>{children}</div>
            <hr />
            <MainFooter/>
            </ErrorBoundary>
        </div>
    );
}
