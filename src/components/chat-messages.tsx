import { PromptMessage } from "../functions/language-model";

import styles from "./chat-messages.module.css";

type Props = {
  messages: PromptMessage[];
};

export const ChatMessages = ({ messages }: Props) => {
  return messages.map(({ role, content }, index) => {
    const isUser = role === "user";
    return isUser ? (
      <div key={index} className={styles.userMessage}>
        {content.toString()}
      </div>
    ) : (
      // TODO: コピペボタンの配置
      <div key={index} className={styles.assistantMessage}>
        {content.toString()}
      </div>
    );
  });
};
