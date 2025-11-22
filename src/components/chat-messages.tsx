import { useState } from "react";

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
        <div className={styles.assistantMessage}>{contentText}</div>
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
