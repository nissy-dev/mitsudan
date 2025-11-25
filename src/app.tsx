import { useEffect, useState } from "react";
import lzstring from "lz-string";

import { ChatInput } from "./components/chat-input";
import { ChatMessages } from "./components/chat-messages";
import { useLanguageModelSession } from "./functions/language-model";

import styles from "./app.module.css";

type Message = {
  role: LanguageModelMessage["role"];
  content: string;
};

function App() {
  const isSharedPage = !!window.location.hash;

  if (isSharedPage) {
    const encodedMessages = window.location.hash.slice(1);
    const decompressedJson =
      lzstring.decompressFromEncodedURIComponent(encodedMessages)!;
    const sharedMessages: LanguageModelMessage[] = JSON.parse(decompressedJson);
    return (
      <>
        <div className={styles.header}>
          <h1 className={styles.title}>mitsudan</h1>
        </div>
        <div className={styles.chat}>
          <ChatMessages messages={sharedMessages} />
        </div>
      </>
    );
  }

  // Toast表示の制御
  const [showToast, setShowToast] = useState(false);
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const { availability, progress, session } = useLanguageModelSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [abortController, setAbortController] =
    useState<AbortController | null>(null);

  const handleOnSend = async (message: string) => {
    setMessages((prev) => [...prev, { role: "user", content: message }]);
    const assistantIndex = messages.length + 1;
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    setIsGenerating(true);
    const controller = new AbortController();
    setAbortController(controller);

    try {
      const result = session?.promptStreaming(message, {
        signal: controller.signal,
      });
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
    } finally {
      setIsGenerating(false);
      setAbortController(null);
    }
  };

  const handleOnStop = () => {
    abortController?.abort();
  };

  // メッセージ共有ボタンの処理
  const handleOnShare = async () => {
    if (messages.length === 0) return;
    const messagesJson = JSON.stringify(messages);
    const encodedMessages =
      lzstring.compressToEncodedURIComponent(messagesJson);
    const shareUrl = `${window.location.origin}${window.location.pathname}#${encodedMessages}`;
    await navigator.clipboard.writeText(shareUrl);
    setShowToast(true);
  };

  const tokenQuota = session?.inputQuota ?? 0;
  const tokenUsage = session?.inputUsage ?? 0;
  const tokenUsagePercentage =
    tokenQuota > 0 ? Math.round((tokenUsage / tokenQuota) * 100) : 0;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>mitsudan</h1>
        <div className={styles.actions}>
          <span>{`Context Usage: ${tokenUsagePercentage}%`}</span>
          <button className={styles.shareButton} onClick={handleOnShare}>
            Share
          </button>
        </div>
      </div>
      {availability === "unavailable" && (
        <div className={styles.statusMessage}>
          このデバイスでは利用できません。PC 版 Chrome
          の最新版でお試しください。
        </div>
      )}
      {(availability === "downloadable" || availability === "downloading") && (
        <div className={styles.statusMessage}>
          Downloading model... {progress.toFixed(2)}%
        </div>
      )}
      {availability === "available" && (
        <>
          <div className={styles.messagesContainer}>
            <ChatMessages messages={messages} />
          </div>
          <div className={styles.inputContainer}>
            <ChatInput
              onSend={handleOnSend}
              onStop={handleOnStop}
              isGenerating={isGenerating}
            />
          </div>
        </>
      )}
      {showToast && (
        <div className={styles.toast}>URL copied to clipboard!</div>
      )}
    </div>
  );
}

export default App;
