import { useState } from "react";

import styles from "./chat-input.module.css";

type Props = {
  onSend: (message: string) => void;
};

export const ChatInput = ({ onSend }: Props) => {
  const [typing, setTyping] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState("");
  const handleOnChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (e.target.value === "\n") return;
    setCurrentPrompt(e.target.value);
  };
  const handleOnKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !typing && !!currentPrompt.trim()) {
      onSend(currentPrompt);
      setCurrentPrompt("");
    }
  };
  return (
    // TODO: ファイルアップロードへの対応
    // TODO: 送信ボタンとチャット停止ボタンの配置
    <textarea
      name="chat-input"
      className={styles.chatTextarea}
      placeholder="プロンプトを入力してください。"
      value={currentPrompt}
      onChange={handleOnChange}
      onKeyDown={handleOnKeyDown}
      onCompositionStart={() => setTyping(true)}
      onCompositionEnd={() => setTyping(false)}
    />
  );
};
