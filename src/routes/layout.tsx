import { LayoutProps, StyledLink } from "rakkasjs";
import "../styles/tailwind.css";
import { MainFooter } from "src/components/footer";

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
