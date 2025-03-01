import React, { useEffect, useRef } from "react";
import hljs from "highlight.js";

interface CodeBlockProps {
  code: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code }) => {
  const codeRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (codeRef.current) {
      hljs.highlightElement(codeRef.current);
    }
  }, [code]);

  return (
    <pre>
      <code ref={codeRef} className="language-javascript">
        {code}
      </code>
    </pre>
  );
};

export default CodeBlock;
