I have a page in my portfolio that's supposed to load a repository and display it's details , but besides the name , languages and topics we don't have other details to describe it in-depth .
Most projects already have readmes which render really nicely on github with GFM , I want that on my page.

We'll start by fetching and parsing the readme into html .

```sh
npm i showdown highlight.js
npm i -D @types/showdown
```

```ts
markdown parser

import showdown from 'showdown';
import hljs from 'highlight.js';




export function convertMarkdownToHtml(markdown: string): string {

    showdown.extension("highlight", function () {
        function htmlunencode(text: string): string {
            return text
                .replace(/&amp;/g, "&")
                .replace(/&lt;/g, "<")
                .replace(/&gt;/g, ">");
        }
        return [
            {
                type: "output",
                filter: function (text: string, converter: any, options: any): string {
                    var left = "<pre><code\\b[^>]*>",
                        right = "</code></pre>",
                        flags = "g";
                    var replacement = function (
                        wholeMatch: string,
                        match: string,
                        left: string,
                        right: string,
                    ): string {
                        match = htmlunencode(match);
                        var lang = (left.match(/class=\"([^ \"]+)/) || [])[1];
                        left = left.slice(0, 18) + "hljs " + left.slice(18);
                        if (lang && hljs.getLanguage(lang)) {
                            return (
                                left + hljs.highlight(match, { language: lang }).value + right
                            );
                        } else {
                            return left + hljs.highlightAuto(match).value + right;
                        }
                    };
                    return showdown.helper.replaceRecursiveRegExp(
                        text,
                        replacement,
                        left,
                        right,
                        flags,
                    );
                },
            },
        ];
    });


    let converter = new showdown.Converter({
        ghCompatibleHeaderId: true,
        simpleLineBreaks: true,
        ghMentions: true,
        extensions: ['highlight'],
        tables: true
    });

    let preContent: string = `
    <html>
      <head>
        <title></title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta charset="UTF-8">

         <link rel="stylesheet"node_modules/highlight.js/styles/atom-one-dark.css">
        <script defer  src="https://plausible.io/js/script.js"></script>
      </head>
      <body>
        <div id=''>
      `;

    let postContent: string = `
        </div>
      </body>
    </html>`;

    let html: string = preContent + converter.makeHtml(markdown) + postContent;

    return html;
}

```

Then we'll add some styles 

```css
.markdown {
  @apply text-base-content leading-normal break-words p-2;
  overflow-x: scroll;
  line-height: 2;
}

.markdown > * + * {
  @apply mt-0 mb-4;
}

.markdown li + li {
  @apply mt-1;
}

.markdown li > p + p {
  @apply mt-6 mb-2;
}

.markdown strong {
  @apply font-semibold;
}

.markdown a {
  @apply text-blue-600 font-semibold;
}
.markdown a:hover {
  @apply text-blue-400 font-semibold;
}

.markdown strong a {
  @apply font-bold;
}

.markdown h1 {
  @apply leading-tight border-b text-4xl font-semibold mb-4 mt-6 pb-2;
}

.markdown h2 {
  @apply leading-tight border-b text-2xl font-semibold mb-4 mt-6 pb-2;
}

.markdown h3 {
  @apply leading-snug text-lg font-semibold mb-4 mt-6;
}

.markdown h4 {
  @apply leading-none text-base font-semibold mb-4 mt-6;
}

.markdown h5 {
  @apply leading-tight text-sm font-semibold mb-4 mt-6;
}

.markdown h6 {
  @apply leading-tight text-sm font-semibold text-base-content mb-4 mt-6;
}

.markdown blockquote {
  @apply text-base border-l-4 border-base-200 px-3  text-base-content/70;
}

.markdown code {
  @apply font-mono text-sm inline bg-base-100/60 rounded-2xl px-1 py-2 my-5;
}

.markdown pre {
  @apply bg-base-200/60 rounded-2xl p-2;
}

.markdown pre code {
  @apply block bg-transparent p-0 overflow-visible rounded-2xl my-5;
}

.markdown ul {
  @apply text-base pl-8 list-disc;
}

.markdown ol {
  @apply text-base pl-4 list-decimal;
}

.markdown kbd {
  @apply text-xs inline-block rounded border px-1 py-5 align-middle font-normal font-mono shadow;
}

.markdown table {
  @apply text-base border-base-300;
}

.markdown th {
  @apply border font-bold text-lg py-1 px-3;
}

.markdown td {
  @apply border py-1 px-3;
}

/* Override pygments style background color. */
.markdown .highlight pre {
  @apply bg-base-200/40 !important;
}

.markdown pre {
  border-radius: "10%";
  font-size: 85%;
  line-height: 1.8;
  overflow: auto;
}

code.hljs {
  padding: 3px 5px;
}
/*

Atom One Dark by Daniel Gamage
Original One Dark Syntax theme from https://github.com/atom/one-dark-syntax

base:    #282c34
mono-1:  #abb2bf
mono-2:  #818896
mono-3:  #5c6370
hue-1:   #56b6c2
hue-2:   #61aeee
hue-3:   #c678dd
hue-4:   #98c379
hue-5:   #e06c75
hue-5-2: #be5046
hue-6:   #d19a66
hue-6-2: #e6c07b

*/
.hljs {
  color: #abb2bf;
  background: #282c34;
}
.hljs-comment,
.hljs-quote {
  color: #5c6370;
  font-style: italic;
}
.hljs-doctag,
.hljs-keyword,
.hljs-formula {
  color: #c678dd;
}
.hljs-section,
.hljs-name,
.hljs-selector-tag,
.hljs-deletion,
.hljs-subst {
  color: #e06c75;
}
.hljs-literal {
  color: #56b6c2;
}
.hljs-string,
.hljs-regexp,
.hljs-addition,
.hljs-attribute,
.hljs-meta .hljs-string {
  color: #98c379;
}
.hljs-attr,
.hljs-variable,
.hljs-template-variable,
.hljs-type,
.hljs-selector-class,
.hljs-selector-attr,
.hljs-selector-pseudo,
.hljs-number {
  color: #d19a66;
}
.hljs-symbol,
.hljs-bullet,
.hljs-link,
.hljs-meta,
.hljs-selector-id,
.hljs-title {
  color: #61aeee;
}
.hljs-built_in,
.hljs-title.class_,
.hljs-class .hljs-title {
  color: #e6c07b;
}
.hljs-emphasis {
  font-style: italic;
}
.hljs-strong {
  font-weight: bold;
}
.hljs-link {
  text-decoration: underline;
}
```
import styles into your project (most projects, Nextjs or Vite require all stylesheets to be added at the root layout or main.tsx component )

```tsx
layout.tsx

import "./globals.css";
import "../state/md/markdown.css";
```


Fetch the readme from github and pass the string into the parser

```tsx
import { convertMarkdownToHtml } from "@/state/md/parse";

interface GetRepoREADME {
  repo: string;
  owner: string;
}
export async function getGithubREADME({ repo, owner }: GetRepoREADME) {
  try {
    const response = await fetch(
      `https://raw.githubusercontent.com/${owner}/${repo}/main/README.md`
    );
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    const text = await response.text();
    if (!text) {
      throw new Error("no parsable readme");
    }
    const output_html = convertMarkdownToHtml(text);
    return output_html;
  } catch (error) {
    console.log(" === error === ", error);
    return;
  }
}
```

We can the use this in our project , am using Nextjs but you can use whatever you want.

```tsx
import { getGithubREADME } from "../helpers/getOneRepomarkdown";

interface OneGithubRepoREADMEProps {
  repo: string;
  owner: string;
}

export async function OneGithubRepoREADME({owner,repo}:OneGithubRepoREADMEProps){
    const data = await getGithubREADME({owner,repo}) 
   
    if (!data ) {
      return null;
    }

return (
 <div id="readme" className='w-[95%] md:w-[85%]  h-full  
 bg-base-200/30 p-5 rounded-xl '>
  <h2 className="text-2xl font-bold text-start w-full capitalize">{repo} readme</h2>
   <div className="markdown" dangerouslySetInnerHTML={{ __html: data}} />
 </div>
);
}

```

This code works on browser or Nodejs and even server components

You can customize the styles by picking another theme from `node_modules/highlight.js/styles` and replacing the existing one in the provided CSS (all that start with `hljs-`)

Shout out to [KrauseFx](https://github.com/KrauseFx/markdown-to-html-github-style) for the code

One extra thing we can add is a stackblitz component to let the visitor play around with our code directly in the browser using the `@stackblitz/sdk` package


```tsx

"use client"
import sdk from "@stackblitz/sdk";
import { useEffect } from "react";

interface stackblitzEmbedProps {
    repo: string;
    owner: string;

}

export function StackblitzEmbed({owner,repo}: stackblitzEmbedProps) {
  const selectedRepo = {
    github: `${owner}/${repo}`,
    openFile: "README.md",
  };

  useEffect(() => {
    sdk.embedGithubProject("embed", selectedRepo.github, {
      height: 1000,
      clickToLoad: true,
      // openFile: selectedRepo.openFile,
    });
  }, [selectedRepo.github]);

  /**
   * Open the project in a new window on StackBlitz
   */
  function openProject() {
    sdk.openGithubProject(selectedRepo.github, {
      // openFile: selectedRepo.openFile,
    });
  }

  return (
  <div id="stackblitz" className="w-full h-full relative">
    <button className="btn btn-sm btn-outline hover:bg-secondary absolute top-[1%] right-[2%]" 
    onClick={openProject} >
      Open in new window
    </button>
    <div id="embed" className="mt-5 p-5 w-[95%] h-full flex items-center justify-center">B</div>

  </div>
  )
}
```

![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/fcieeapvxrk3jhqu0w4i.png)

[Javascript , I love it](https://www.youtube.com/watch?v=Uo3cL4nrGOk&t=323s)



