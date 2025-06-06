"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ContactLinks } from "../ContactLinks";
import { siteConfig } from "./site";
import { ChevronLeft } from "lucide-react";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { LinkLoading } from "@/components/shared/LinkLoading";
import { Toaster } from "react-hot-toast";
interface pageContainerProps {
  children: React.ReactNode;
}

export function PageContainer({ children }: pageContainerProps) {
  const links = siteConfig.navItems;
  const pathnaame = usePathname();
  const show_navbar_links = pathnaame === "/";

  return (
    <NuqsAdapter>
      <div className="drawer overflow-x-clip ">
        <input id="my-drawer-3" type="checkbox" className="drawer-toggle" />
        <div
          className="drawer-content flex flex-col
    bg-linear-to-tr from-base-200 via-primary/50  to-base-200">
          {/* Navbar */}
          <div className="w-full navbar  min-h-10 h-12 z-40 m-2  justify-between sticky top-0 ">
            {!show_navbar_links && (
              <Link
                className="hover:text-accent  z-50 flex gap-2 justify-center items-center"
                href="..">
                <LinkLoading>
                  <ChevronLeft className="size-14 " />
                </LinkLoading>
              </Link>
            )}
            <div className="flex-none md:hidden ">
              <label
                htmlFor="my-drawer-3"
                aria-label="open sidebar"
                className="btn btn-square btn-ghost">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  className="inline-block w-6 h-6 stroke-current">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"></path>
                </svg>
              </label>
            </div>

            <div className="hidden menu md:flex gap-1  h-full w-full justify-center items-center ">
              {show_navbar_links && (
                <ul className="menu menu-horizontal p-0 bg-transparent md:glass rounded-xl">
                  {links.map((link) => (
                    <li key={link.label}>
                      <Link
                        key={link.label}
                        href={link.href}
                        className="hover:text-secondary hover:bg-secondary/40 px-3  text-base font-semibold ">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          {/* Page content here */}
          {children}
          <div className="fixed right-[1%] top-[30%] hidden lg:flex ">
            <ContactLinks navbar/>
          </div>
        </div>
        <div className="drawer-side z-30">
          <label
            htmlFor="my-drawer-3"
            aria-label="close sidebar"
            className="drawer-overlay"></label>
          {show_navbar_links && (
            <ul className="menu p-4 w-80 min-h-full bg-base-300/80 z-30  mt-10 gap-2">
              {links.map((link) => (
                <li key={link.label} onClick={() => closeOnLinkClick()}>
                  <Link
                    key={link.label}
                    href={link.href}
                    className="hover:text-secondary text-xl bg-base-100/10 hover:bg-secondary/40 px-3  text-md font-semibold ">
                    {link.label}
                  </Link>
                </li>
              ))}
              <div className="mt-6">
              <ContactLinks  /> 
              </div>
            </ul>
          )}
        </div>
        <Toaster
          toastOptions={{
            className: "z-50",
            position: "bottom-left",
            duration: 2000,
            style: {
              background: "#1e293b",
              color: "#fff",
            },
          }}
        />
      </div>
    </NuqsAdapter>
  );
}

function closeOnLinkClick() {
  if (window) {
    document.getElementById("my-drawer-3")?.click();
  }
}
