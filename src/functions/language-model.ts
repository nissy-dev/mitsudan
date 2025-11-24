import { useEffect, useRef, useState } from "react";

export const useLanguageModelSession = (): {
  availability: Availability;
  progress: number;
  session: LanguageModel | null;
} => {
  if (!("LanguageModel" in window)) {
    return { availability: "unavailable", progress: 0, session: null };
  }

  const [availability, setAvailability] = useState<Availability | null>(null);
  const checkAvailability = async () => {
    setAvailability(await LanguageModel.availability());
  };
  useEffect(() => {
    checkAvailability();
  }, []);

  const [session, setSession] = useState<LanguageModel | null>(null);
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
