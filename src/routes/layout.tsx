import { LayoutProps, StyledLink } from "rakkasjs";
import { MainFooter } from "../components/footer";
import "../styles/tailwind.css";


export default function MainLayout({ children }: LayoutProps) {
    return (
        <div>
            <hr />
            <div>{children}</div>
            <hr />
            <MainFooter/>
        </div>
    );
}
