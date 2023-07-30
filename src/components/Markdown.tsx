import DOMPurify from "isomorphic-dompurify";
import { marked } from "marked";
import { useMemo } from "react";
import hljs from "highlight.js";
import "highlight.js/styles/atom-one-dark.css";

// Initialize and use highlight.js
marked.setOptions({
  highlight: function (code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(lang, code).value;
    } else {
      return code;
    }
  },
});

// A simple component to render markdown
export const Markdown = ({ markdown }: { markdown: string }) => {
  const renderedMarkdown = useMemo(
    () => DOMPurify.sanitize(marked.parse(markdown)),
    [markdown],
  );

  return (
    <span
      className="markdown"
      dangerouslySetInnerHTML={{
        __html: renderedMarkdown,
      }}
    />
  );
};
