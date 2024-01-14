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


