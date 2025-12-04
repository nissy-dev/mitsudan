import { useEffect, useState } from "react";

export const useLanguageModelSession = (): {
  availability: Availability;
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
  useEffect(() => {
    if (!isLanguageModelDefined) return;
    LanguageModel.create({
      expectedInputs: [{ type: "text", languages: ["ja"] }],
      expectedOutputs: [{ type: "text", languages: ["ja"] }],
    }).then((newSession) => {
      setSession(newSession);
    });
  }, [isLanguageModelDefined]);

  return { availability, session };
};
