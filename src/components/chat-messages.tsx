import { useState } from "react";
import ReactMarkdown from "react-markdown";
import SyntaxHighlighter from "react-syntax-highlighter";

import { PromptMessage } from "../functions/language-model";

import styles from "./chat-messages.module.css";

type Props = {
  messages: PromptMessage[];
};

export const ChatMessages = ({ messages }: Props) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const handleCopy = async (content: string, index: number) => {
    await navigator.clipboard.writeText(content);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return messages.map(({ role, content }, index) => {
    const contentText = content.toString();
    const isUser = role === "user";
    const isCopied = copiedIndex === index;
    return isUser ? (
      <div key={index} className={styles.userMessage}>
        {content.toString()}
      </div>
    ) : (
      <div key={index} className={styles.assistantMessageContainer}>
        <div className={styles.assistantMessage}>
          <ReactMarkdown
            components={{
              code({ className, children, ...props }) {
                const match = /language-(\w+)/.exec(className);
                const language = match ? match[1] : "";
                if (!language) {
                  return <code className={className}>{children}</code>;
                }
                return (
                  <SyntaxHighlighter language={language}>
                    {String(children).replace(/\n$/, "")}
                  </SyntaxHighlighter>
                );
              },
            }}
          >
            {contentText}
          </ReactMarkdown>
        </div>
        <button
          className={styles.copyButton}
          onClick={() => handleCopy(contentText, index)}
        >
          {isCopied ? "コピーしました" : "コピーする"}
        </button>
      </div>
    );
  });
};
