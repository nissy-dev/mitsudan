import { useCallback, useEffect, useRef, useState } from "react";

export const useLanguageModelSession = (): {
  availability: Availability;
  promptStreaming: (
    message: string,
    options?: { signal?: AbortSignal }
  ) => Promise<ReadableStream<string>>;
  session: LanguageModel | null;
} => {
  const isLanguageModelDefined = "LanguageModel" in window;
  const initialAvailability = isLanguageModelDefined ? null : "unavailable";
  const [availability, setAvailability] = useState<Availability | null>(
    initialAvailability
  );
  const sessionRef = useRef<LanguageModel | null>(null);

  useEffect(() => {
    if (!isLanguageModelDefined) return;
    LanguageModel.availability().then((availability) => {
      setAvailability(availability);
    });
  }, [isLanguageModelDefined]);

  const promptStreaming = useCallback(
    async (message: string, options?: { signal?: AbortSignal }) => {
      // ページ読み込み時に session を作ろうとしたが、以下のエラーが出た
      // NotAllowedError: Requires a user gesture when availability is "downloading" or "downloadable".
      // モデルのダウンロードにはユーザーのアクションが必要なようなので、click 時に呼ばれるこの関数内で session を初期化する
      if (!sessionRef.current) {
        sessionRef.current = await LanguageModel.create({
          expectedInputs: [{ type: "text", languages: ["ja"] }],
          expectedOutputs: [{ type: "text", languages: ["ja"] }],
        });
      }
      return sessionRef.current.promptStreaming(message, options);
    },
    []
  );

  // eslint-disable-next-line react-hooks/refs
  return { availability, promptStreaming, session: sessionRef.current };
};
