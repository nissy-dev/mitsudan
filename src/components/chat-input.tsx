import { useState } from "react";

import styles from "./chat-input.module.css";

type Props = {
  onSend: (message: string) => void;
  onStop: () => void;
  isGenerating: boolean;
};

export const ChatInput = ({ onSend, onStop, isGenerating }: Props) => {
  const [typing, setTyping] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState("");

  const handleOnChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (e.target.value === "\n") return;
    setCurrentPrompt(e.target.value);
  };

  const handleOnKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !typing && !!currentPrompt.trim()) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    onSend(currentPrompt);
    setCurrentPrompt("");
  };

  return (
    <div className={styles.inputContainer}>
      <div className={styles.inputRow}>
        <textarea
          name="chat-input"
          className={styles.chatTextarea}
          placeholder="プロンプトを入力してください。"
          value={currentPrompt}
          onChange={handleOnChange}
          onKeyDown={handleOnKeyDown}
          onCompositionStart={() => setTyping(true)}
          onCompositionEnd={() => setTyping(false)}
          disabled={isGenerating}
        />
        {isGenerating ? (
          <button className={styles.stopButton} onClick={onStop}>
            ⏹
          </button>
        ) : (
          <button
            className={styles.sendButton}
            onClick={handleSend}
            disabled={!currentPrompt.trim()}
          >
            ↑
          </button>
        )}
      </div>
    </div>
  );
};
