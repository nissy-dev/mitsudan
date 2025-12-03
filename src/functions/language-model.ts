import { useEffect, useState } from "react";

export const useLanguageModelSession = (): {
  availability: Availability;
  progress: number;
  session: LanguageModel | null;
} => {
  const isLanguageModelDefined = "LanguageModel" in window;
  const initialAvailability = isLanguageModelDefined ? null : "unavailable";
  const [availability, setAvailability] = useState<Availability | null>(
    initialAvailability
  );
  useEffect(() => {
    if (!isLanguageModelDefined) return;
    LanguageModel.availability().then((availability) => {
      setAvailability(availability);
    });
  }, [isLanguageModelDefined]);

  const [session, setSession] = useState<LanguageModel | null>(null);
  const [progress, setProgress] = useState<number>(0);
  useEffect(() => {
    if (!isLanguageModelDefined) return;
    LanguageModel.create({
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
    }).then((newSession) => {
      setSession(newSession);
    });
  }, [isLanguageModelDefined]);

  return { availability, progress, session };
};
