import { j as jsxs, a as jsx } from "./jsx-runtime-746fc63d.js";
import { L as Link, E as ErrorBoundary2 } from "../hattip.js";
import "react/jsx-runtime";
import "react";
import "devalue";
import "@hattip/compose";
import "react-dom/server.browser";
function MainFooter({}) {
  return /* @__PURE__ */ jsxs("footer", { className: "w-full flex items-center justify-evenly bg-slate-800 p-5", children: [
    /* @__PURE__ */ jsx("div", { className: "text-base md:text-lg text-slate-300 font-bold", children: "Contact me" }),
    /* @__PURE__ */ jsx("div", { className: "my-2 md:my-0 text-sm md:text-lg text-slate-300 font-mono", children: "Email: denniskinuthiaw@gmail.com" }),
    /* @__PURE__ */ jsxs("div", { className: "my-2 md:my-0 text-sm md:text-lg text-slate-300 font-mono", children: [
      "Github:",
      /* @__PURE__ */ jsx(Link, { href: "https://github.com/tigawanna", target: "_blank", className: "text-green-400", children: "tigawanna" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "my-2 md:my-0 text-sm md:text-lg text-slate-300 font-mono", children: [
      "Linkedin:",
      /* @__PURE__ */ jsx(Link, { href: "https://linkedin.com/in/dennis-kinuthia", target: "_blank", className: "text-green-400", children: "Dennis kinuthia" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "my-2 md:my-0 text-sm md:text-lg text-slate-300 font-mono", children: [
      "Articles:",
      /* @__PURE__ */ jsx(Link, { href: "https://dev.to/tigawanna", target: "_blank", className: "text-green-400", children: "tigawanna" })
    ] })
  ] });
}
function RakkasErrorBoundary({ error, resetErrorBoundary }) {
  return /* @__PURE__ */ jsxs("div", { className: "w-full h-screen flex flex-col items-center justify-center bg-red-100 text-red-900 ", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold  ", children: "An error has occurred" }),
    /* @__PURE__ */ jsx("pre", { className: "bg-red-50 p-5 rounded-lg border-red-900", children: error.message }),
    /* @__PURE__ */ jsx(
      "button",
      {
        className: "bg-green-500 p-1 px-2 text-green-50 text-lg font-bold",
        onClick: () => {
          resetErrorBoundary();
        },
        children: "Try again"
      }
    )
  ] });
}
const tailwind = "";
function MainLayout({ children }) {
  return /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsxs(
    ErrorBoundary2,
    {
      fallbackRender: ({ error, resetErrorBoundary }) => /* @__PURE__ */ jsx(RakkasErrorBoundary, { error, resetErrorBoundary }),
      children: [
        /* @__PURE__ */ jsx("hr", {}),
        /* @__PURE__ */ jsx("div", { children }),
        /* @__PURE__ */ jsx("hr", {}),
        /* @__PURE__ */ jsx(MainFooter, {})
      ]
    }
  ) });
}
export {
  MainLayout as default
};
