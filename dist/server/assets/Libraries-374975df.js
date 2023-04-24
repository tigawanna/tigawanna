import { j as jsxs, a as jsx, F as Fragment } from "./jsx-runtime-746fc63d.js";
import { u as useServerSideQuery } from "../hattip.js";
import kleur from "kleur";
import { Suspense } from "react";
import { IconContext } from "react-icons";
import { FaPrint } from "react-icons/fa/index.js";
import { SiReact, SiNodedotjs, SiVite, SiRelay, SiNextdotjs, SiTailwindcss, SiSupabase, SiTypescript, SiJavascript, SiReactrouter, SiReactquery, SiFirebase, SiGooglecalendar, SiAxios, SiSocketdotio, SiGoland, SiTestinglibrary, SiRollupdotjs, SiExpress, SiGraphql, SiJest, SiVitest } from "react-icons/si/index.js";
import "react/jsx-runtime";
import "devalue";
import "@hattip/compose";
import "react-dom/server.browser";
function logNormal(message, data) {
  console.log(kleur.blue(`${message}`));
  data && console.log(data);
}
function logSuccess(message, data) {
  console.log(kleur.green(`Success: ${message}`));
  data && console.log(data);
}
async function getFavDeps(viewer_token) {
  const headersList = {
    "Accept": "*/*",
    "User-Agent": "Thunder Client (https://www.thunderclient.com)",
    "authorization": `Bearer ${viewer_token}`
  };
  try {
    const res = await fetch("https://mongo-project.onrender.com/github", {
      method: "GET",
      headers: headersList
    });
    const data = await res.json();
    if (data && (data == null ? void 0 : data.error)) {
      throw data;
    }
    logNormal("favdeps", res.status);
    logSuccess("data === ", data);
    return data;
  } catch (error) {
    return error;
  }
}
const subDepsIcons = {
  react: { icon: SiReact, name: "React" },
  nodejs: { icon: SiNodedotjs, name: "Nodejs" },
  vite: { icon: SiVite, name: "Vite" },
  relay: { icon: SiRelay, name: "Relay" },
  nextjs: { icon: SiNextdotjs, name: "Nextjs" },
  tailwindcss: { icon: SiTailwindcss, name: "Tailwind CSS" },
  supabase: { icon: SiSupabase, name: "Supabase" },
  typescript: { icon: SiTypescript, name: "TypeScript" },
  javascript: { icon: SiJavascript, name: "JavaScript" },
  "react-router-dom": { icon: SiReactrouter, name: "React Router DOM" },
  "react-query": { icon: SiReactquery, name: "React Query" },
  "react-icons": { icon: SiReact, name: "React Icons" },
  firebase: { icon: SiFirebase, name: "Firebase" },
  dayjs: { icon: SiGooglecalendar, name: "Day.js" },
  axios: { icon: SiAxios, name: "Axios" },
  "socket.io": { icon: SiSocketdotio, name: "Socket.IO" },
  pocketbase: { icon: SiGoland, name: "PocketBase" },
  "@testing-library": { icon: SiTestinglibrary, name: "Testing Library" },
  "react-to-print": { icon: FaPrint, name: "React To Print" },
  "@tanstack/react-query": { icon: SiReactquery, name: "@tanstack" },
  rollup: { icon: SiRollupdotjs, name: "Rollup.js" },
  express: { icon: SiExpress, name: "Express" },
  graphql: { icon: SiGraphql, name: "GraphQL" },
  jest: { icon: SiJest, name: "Jest" },
  vitest: { icon: SiVitest, name: "Vitest" }
};
function Library({ pkg }) {
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: "w-full md:w-[40%] h-[200px]  p-2 flex flex-col items-center\r\n        border-2 border-green-500 rounded-xl shadow hover:brightness-150 shadow-green-300",
      children: [
        /* @__PURE__ */ jsxs("div", { className: "w-full font-bold flex  items-center gap-2 p-1", children: [
          /* @__PURE__ */ jsx("div", { className: "text-4xl flex items-center justify-center gap-1", children: /* @__PURE__ */ jsx(
            IconContext.Provider,
            {
              value: { color: "#86efac", size: "40", className: "flex " },
              children: /* @__PURE__ */ jsx(PkgIconComponent, { pkg: pkg._id })
            }
          ) }),
          /* @__PURE__ */ jsx("div", { className: "text-xl", children: pkg._id }),
          /* @__PURE__ */ jsxs("div", { className: "p-2 border border-green-500 rounded-full", children: [
            pkg.repo_names.length,
            " projects"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: " flex flex-wrap gap-1", children: [
          /* @__PURE__ */ jsx("h2", { className: "w-full text-bold text-green-200 p-1", children: "Top Dependancies" }),
          pkg.top_favdeps.map((dep, idx) => {
            return /* @__PURE__ */ jsx(
              "div",
              {
                className: "flex items-center justify-center \r\n                         px-2 border border-green-600 rounded-lg",
                children: dep
              },
              dep + idx
            );
          })
        ] })
      ]
    },
    pkg._id
  );
}
function PkgIconComponent({ pkg }) {
  const ReactIcon = subDepsIcons["react"].icon;
  const RelayIcon = subDepsIcons["relay"].icon;
  const NextjsIcon = subDepsIcons["nextjs"].icon;
  const NodejsIcon = subDepsIcons["nodejs"].icon;
  const ViteIcon = subDepsIcons["vite"].icon;
  const JsIcon = subDepsIcons["javascript"].icon;
  const TsIcon = subDepsIcons["typescript"].icon;
  if (pkg === "React+Relay") {
    return /* @__PURE__ */ jsxs(Fragment, { children: [
      " ",
      /* @__PURE__ */ jsx(ReactIcon, {}),
      " + ",
      /* @__PURE__ */ jsx(RelayIcon, {}),
      " "
    ] });
  }
  if (pkg === "Rakkasjs") {
    return /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(ReactIcon, {}),
      " + ",
      /* @__PURE__ */ jsx(ViteIcon, {})
    ] });
  }
  if (pkg === "Nextjs") {
    return /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsx(NextjsIcon, {}) });
  }
  if (pkg === "Nodejs") {
    return /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsx(NodejsIcon, {}) });
  }
  if (pkg === "React+Vite") {
    return /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(ReactIcon, {}),
      " + ",
      /* @__PURE__ */ jsx(ViteIcon, {})
    ] });
  }
  if (pkg === "Others") {
    return /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(JsIcon, {}),
      "/",
      /* @__PURE__ */ jsx(TsIcon, {})
    ] });
  }
  return null;
}
function Libraries({}) {
  const {
    data,
    refetch
  } = useServerSideQuery(["0", 0, [], $runServerSide$[0]]);
  if (data && "error" in data) {
    return null;
  }
  return /* @__PURE__ */ jsx(Suspense, {
    fallback: "...",
    children: /* @__PURE__ */ jsxs("div", {
      className: "w-full h-full flex flex-wrap items-center justify-center gap-2 p-2",
      children: [/* @__PURE__ */ jsx("h2", {
        className: "w-full text-3xl p-5 md:text-4xl text-slate-400 font-bold",
        children: "Github Projects Breakdown"
      }), data && (data == null ? void 0 : data.map((pkg) => {
        return /* @__PURE__ */ jsx(Library, {
          pkg
        }, pkg._id);
      }))]
    })
  });
}
const $runServerSide$ = [async ($runServerSideClosure$) => {
  return getFavDeps("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");
}];
export {
  $runServerSide$,
  Libraries
};
