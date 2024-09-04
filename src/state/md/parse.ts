import hljs from "highlight.js";
import showdown from "showdown";

export function convertMarkdownToHtml(markdown: string): string {
  showdown.extension("highlight", () => {
    function htmlunencode(text: string): string {
      return text
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">");
    }
    return [
      {
        type: "output",
        filter: (text: string, converter: any, options: any): string => {
          var left = "<pre><code\\b[^>]*>",
            right = "</code></pre>",
            flags = "g";
          var replacement = (
            wholeMatch: string,
            match: string,
            left: string,
            right: string,
          ): string => {
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

  const converter = new showdown.Converter({
    ghCompatibleHeaderId: true,
    simpleLineBreaks: true,
    ghMentions: true,
    extensions: ["highlight"],
    tables: true,
  });

  const preContent = `
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

  const postContent = `
        </div>
      </body>
    </html>`;

  const html: string = preContent + converter.makeHtml(markdown) + postContent;

  return html;
}
