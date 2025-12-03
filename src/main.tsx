import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { Chat } from "./chat";
import { SharedChat } from "./shared-chat";

import "./global.css";

const isSharedPage = !!window.location.hash;

createRoot(document.getElementById("root")!).render(
  <StrictMode>{isSharedPage ? <SharedChat /> : <Chat />}</StrictMode>
);
