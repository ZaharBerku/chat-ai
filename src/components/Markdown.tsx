import ReactMarkdown from "react-markdown";
import { BiCopy } from "react-icons/bi";
import { MdOutlineDone } from "react-icons/md";
import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import tsx from "react-syntax-highlighter/dist/cjs/languages/prism/tsx";
import typescript from "react-syntax-highlighter/dist/cjs/languages/prism/typescript";
import scss from "react-syntax-highlighter/dist/cjs/languages/prism/scss";
import bash from "react-syntax-highlighter/dist/cjs/languages/prism/bash";
import markdown from "react-syntax-highlighter/dist/cjs/languages/prism/markdown";
import json from "react-syntax-highlighter/dist/cjs/languages/prism/json";
import python from "react-syntax-highlighter/dist/cjs/languages/prism/python";
import javascript from "react-syntax-highlighter/dist/cjs/languages/prism/javascript";
import jsx from "react-syntax-highlighter/dist/cjs/languages/prism/jsx";
import rangeParser from "parse-numeric-range";
import { oneDark } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { ReactNode, useEffect, useState } from "react";
import remarkGfm from "remark-gfm";
import "github-markdown-css";

SyntaxHighlighter.registerLanguage("tsx", tsx);
SyntaxHighlighter.registerLanguage("typescript", typescript);
SyntaxHighlighter.registerLanguage("scss", scss);
SyntaxHighlighter.registerLanguage("bash", bash);
SyntaxHighlighter.registerLanguage("markdown", markdown);
SyntaxHighlighter.registerLanguage("json", json);
SyntaxHighlighter.registerLanguage("python", python);
SyntaxHighlighter.registerLanguage("javascript", javascript);
SyntaxHighlighter.registerLanguage("jsx", jsx);

const syntaxTheme = oneDark;

const MarkdownComponents: object = {
  code({
    node,
    inline,
    className,
    ...props
  }: {
    node: { data: { meta: string } };
    inline: boolean;
    className: string;
  } & Record<string, unknown>): ReactNode {
    const [isCopied, setIsCopied] = useState(false);
    const match = /language-(\w+)/.exec(className || "");
    const hasMeta = node?.data?.meta;

    const applyHighlights: object = (applyHighlights: number) => {
      if (hasMeta) {
        const RE = /{([\d,-]+)}/;
        const metadata = node.data.meta?.replace(/\s/g, "");
        const strlineNumbers = RE?.test(metadata)
          ? RE?.exec(metadata)![1]
          : "0";
        const highlightLines = rangeParser(strlineNumbers);
        if (highlightLines.includes(applyHighlights)) {
          return { className: "highlight" };
        }
      }
      return {};
    };
    const children =
      typeof props.children === "string" || Array.isArray(props.children)
        ? props.children
        : "";
    const handleCopyClick = () => {
      const textToCopy = children as string;
      navigator.clipboard.writeText(textToCopy);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    };

    return match ? (
      <SyntaxHighlighter
        style={syntaxTheme}
        language={match[1]}
        PreTag={(props) => (
          <div {...props} className={`${props.className} !p-0`}>
            <div className="flex justify-end px-3 pt-3 relative">
              <button
                onClick={handleCopyClick}
                className="bg-slate flex gap-1 items-center text-xs text-slate-500"
              >
                {isCopied ? <MdOutlineDone /> : <BiCopy />}
                {isCopied ? "Copied!" : "Copy Code"}
              </button>
            </div>
            <div {...props}>{props.children}</div>
          </div>
        )}
        className="codeStyle block"
        showLineNumbers={true}
        wrapLines={hasMeta ? true : false}
        useInlineStyles={true}
        lineProps={applyHighlights}
        {...props}
      >
        {children}
      </SyntaxHighlighter>
    ) : (
      <code className={className} {...props} />
    );
  },
  a: ({ href, children }: JSX.IntrinsicElements["a"]) => (
    <a href={href} target="_blank" rel="noreferrer">
      {children}
    </a>
  ),
  h1: ({ children, id }: JSX.IntrinsicElements["h1"]) => (
    <h1 id={id}>{children}</h1>
  ),
  h2: ({ children, id }: JSX.IntrinsicElements["h2"]) => (
    <h2 id={id}>{children}</h2>
  ),
  h3: ({ children, id }: JSX.IntrinsicElements["h3"]) => (
    <h3 id={id}>{children}</h3>
  ),
  h4: ({ children, id }: JSX.IntrinsicElements["h4"]) => (
    <h4 id={id}>{children}</h4>
  ),
  h5: ({ children, id }: JSX.IntrinsicElements["h5"]) => (
    <h5 id={id}>{children}</h5>
  ),
  h6: ({ children, id }: JSX.IntrinsicElements["h6"]) => (
    <h6 id={id}>{children}</h6>
  ),
  p: ({ children }: JSX.IntrinsicElements["p"]) => {
    return <p>{children}</p>;
  },
  strong: ({ children }: JSX.IntrinsicElements["strong"]) => (
    <strong>{children}</strong>
  ),
  em: ({ children }: JSX.IntrinsicElements["em"]) => <em>{children}</em>,
  pre: ({ children }: JSX.IntrinsicElements["pre"]) => {
    return (
      <div>
        <pre>{children}</pre>
      </div>
    );
  },
  ul: ({ children }: JSX.IntrinsicElements["ul"]) => <ul>{children}</ul>,
  ol: ({ children }: JSX.IntrinsicElements["ol"]) => <ol>{children}</ol>,
  li: ({ children }: JSX.IntrinsicElements["li"]) => <li>{children}</li>,
  table: ({ children }: JSX.IntrinsicElements["table"]) => (
    <div>
      <table>{children}</table>
    </div>
  ),
  thead: ({ children }: JSX.IntrinsicElements["thead"]) => (
    <thead>{children}</thead>
  ),
  th: ({ children }: JSX.IntrinsicElements["th"]) => <th>{children}</th>,
  td: ({ children }: JSX.IntrinsicElements["td"]) => <td>{children}</td>,
  blockquote: ({ children }: JSX.IntrinsicElements["blockquote"]) => (
    <blockquote>{children}</blockquote>
  ),
};

type Props = {
  content: string;
  style?: any;
};

const MarkdownRenderer: React.FC<Props> = ({ content, ...props }) => {
  return (
    <div className="markdown-body markdown" {...props}>
      <ReactMarkdown
        components={MarkdownComponents}
        remarkPlugins={[remarkGfm]}
        children={content}
        urlTransform={(url) => url.replace(/&amp;/g, "&")}
      ></ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
