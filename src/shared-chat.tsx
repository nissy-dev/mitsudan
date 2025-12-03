import lzstring from "lz-string";

import { ChatMessages } from "./components/chat-messages";

import styles from "./shared-chat.module.css";

export function SharedChat() {
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
