import { useState } from "react";

import { ChatMessages } from "./components/chat-messages";
import {
  PromptMessage,
  useLanguageModelSession,
} from "./functions/language-model";
import { ChatInput } from "./components/chat-input";

import styles from "./app.module.css";

type Message = {
  role: PromptMessage["role"];
  content: string;
};

function App() {
  const { availability, session } = useLanguageModelSession();

  const [messages, setMessages] = useState<Message[]>([]);
  const handleOnSend = async (message: string) => {
    setMessages((prev) => [...prev, { role: "user", content: message }]);
    const assistantIndex = messages.length + 1;
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);
    const result = session?.promptStreaming(message);
    for await (const chunk of result!) {
      setMessages((prev) => {
        const newMessages = [...prev];
        newMessages[assistantIndex] = {
          role: "assistant",
          content: newMessages[assistantIndex].content + chunk,
        };
        return newMessages;
      });
    }
  };

  if (availability === "unavailable") {
    return (
      <div>Your device does not support the Chrome Language Model API.</div>
    );
  }

  return (
    // TODO: コンテキストの量の表示
    // TODO: 会話履歴の共有ボタンの配置 (base64 エンコードして URL に含める)
    <>
      <h1 className={styles.header}>mitsudan</h1>
      <div className={styles.chat}>
        <ChatMessages messages={messages} />
        <ChatInput onSend={handleOnSend} />
      </div>
    </>
  );
}

export default App;
