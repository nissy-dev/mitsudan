import { useEffect, useRef, useState } from "react";

export const useLanguageModelSession = (): {
  availability: AvailabilityStatus;
  progress: number;
  session: LanguageModelSession | null;
} => {
  if (!("LanguageModel" in window)) {
    return { availability: "unavailable", progress: 0, session: null };
  }

  const [availability, setAvailability] = useState<AvailabilityStatus | null>(
    null
  );
  const checkAvailability = async () => {
    setAvailability(await LanguageModel.availability());
  };
  useEffect(() => {
    checkAvailability();
  }, []);

  const [session, setSession] = useState<LanguageModelSession | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const createSession = async () => {
    if (availability !== "available") return;
    const newSession = await LanguageModel.create({
      expectedInputs: [{ type: "text", languages: ["ja"] }],
      expectedOutputs: [{ type: "text", languages: ["ja"] }],
      monitor: (monitor: EventTarget) => {
        monitor.addEventListener("downloadprogress", (evt: ProgressEvent) => {
          if (evt.lengthComputable) {
            const percentComplete = (evt.loaded / evt.total) * 100;
            setProgress(percentComplete);
          }
        });
      },
    });
    setSession(newSession);
  };
  useEffect(() => {
    createSession();
  }, [availability]);

  return { availability, progress, session };
};

// Type definitions for the Prompt API (Prompt a built‑in language model)
// Based on: Chrome Dev & WebML Prompt API proposal
//   – Chrome doc: https://developer.chrome.com/docs/ai/prompt-api?hl=ja
//   – GH proposal: https://github.com/webmachinelearning/prompt-api :contentReference[oaicite:4]{index=4}

/** Availability status of model/session given options. */
export type AvailabilityStatus =
  | "unavailable"
  | "downloadable"
  | "downloading"
  | "available";

/** Supported modality types for inputs/outputs. */
export type ModalityType = "text" | "image" | "audio";

/** BCP‑47 language tag string, e.g. "en", "ja", "en-US". */
export type LangTag = string;

/** Descriptor of expected I/O for session creation. */
export interface ExpectedIO {
  type: ModalityType;
  languages?: LangTag[]; // languages that will be used for that modality. :contentReference[oaicite:5]{index=5}
}

/** A piece of multimodal content in a message. */
export type ContentPiece =
  | { type: "text"; value: string }
  | { type: "image"; value: Blob | File | string | ImageBitmapSource } // per spec: Blob, ImageData, ImageBitmap, HTMLImageElement, etc. :contentReference[oaicite:6]{index=6}
  | { type: "audio"; value: Blob | AudioBuffer | string }; // per spec: Blob, AudioBuffer, BufferSource. :contentReference[oaicite:7]{index=7}

/** Role in the chat/message sequence. */
export type MessageRole = "system" | "user" | "assistant";

/** A message in the prompt/session conversation. */
export interface PromptMessage {
  role: MessageRole;
  content: string | ContentPiece[]; // If multimodal content, use array form. :contentReference[oaicite:8]{index=8}
  prefix?: boolean; // Indicates this message is a prefix for the assistant’s next response. :contentReference[oaicite:9]{index=9}
}

/** Definition of a tool that the model can invoke. */
export interface LanguageModelTool {
  name: string;
  description: string;
  inputSchema: object; // JSON Schema describing tool parameters. :contentReference[oaicite:10]{index=10}
  execute: (args: any) => Promise<any> | any; // function to be invoked by user‑agent. :contentReference[oaicite:11]{index=11}
}

/** Options for creating a session. */
export interface CreateSessionOptions {
  signal?: AbortSignal;
  initialPrompts?: PromptMessage[];
  expectedInputs?: ExpectedIO[];
  expectedOutputs?: ExpectedIO[];
  temperature?: number;
  topK?: number;
  tools?: LanguageModelTool[];
  monitor?: (evtTarget: EventTarget) => void; // monitor eventTarget for downloadprogress. :contentReference[oaicite:12]{index=12}
}

/** Options for prompt/promptStreaming. */
export interface PromptOptions {
  signal?: AbortSignal;
  responseConstraint?: object | RegExp; // JSON Schema object or RegExp. :contentReference[oaicite:13]{index=13}
  omitResponseConstraintInput?: boolean;
}

/** Options for append() method. */
export interface AppendOptions {
  signal?: AbortSignal;
}

/** Options for clone() method. */
export interface CloneOptions {
  signal?: AbortSignal;
}

/** Model parameters (defaults / maxima) returned by params(). */
export interface ModelParams {
  defaultTemperature: number;
  maxTemperature: number;
  defaultTopK: number;
  maxTopK: number;
}

/** The Session instance interface. */
export interface LanguageModelSession extends EventTarget {
  readonly inputUsage: number;
  readonly inputQuota: number;

  prompt(
    input: string | PromptMessage | PromptMessage[],
    options?: PromptOptions
  ): Promise<string>;
  promptStreaming(
    input: string | PromptMessage | PromptMessage[],
    options?: PromptOptions
  ): ReadableStream<string>;
  append(
    input: string | PromptMessage | PromptMessage[],
    options?: AppendOptions
  ): Promise<void>;
  clone(options?: CloneOptions): Promise<LanguageModelSession>;
  destroy(): void;

  measureInputUsage(
    input: string | PromptMessage | PromptMessage[],
    options?: { responseConstraint?: object | RegExp; signal?: AbortSignal }
  ): Promise<number>;
  params?(): Promise<ModelParams | null>;
}

/** The global/static interface of the LanguageModel. */
export interface LanguageModelStatic extends EventTarget {
  availability(
    options?:
      | CreateSessionOptions
      | { expectedInputs?: ExpectedIO[]; expectedOutputs?: ExpectedIO[] }
  ): Promise<AvailabilityStatus>;
  create(options?: CreateSessionOptions): Promise<LanguageModelSession>;
  params(): Promise<ModelParams | null>;
}

declare global {
  var LanguageModel: LanguageModelStatic;
}
