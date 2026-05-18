"use client";
import { useState } from "react";
import { analyzeSource } from "@/shared/lib/ai";
import type { AnalysisResult } from "@/shared/mocks/analysis";

export type UploadStep = "select-type" | "pick-file" | "analyzing" | "result";
export type SourceType = "photo" | "lecture-log" | "memo";

export function useUploadFlow() {
  const [step, setStep] = useState<UploadStep>("select-type");
  const [sourceType, setSourceType] = useState<SourceType | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  function pickType(t: SourceType) {
    setSourceType(t);
    setStep("pick-file");
  }

  async function uploadFile(_file: File | null) {
    setStep("analyzing");
    const r = await analyzeSource({ sourceId: "mock-" + Date.now() });
    setResult(r);
    setStep("result");
  }

  function reset() {
    setStep("select-type");
    setSourceType(null);
    setResult(null);
  }

  return { step, sourceType, result, pickType, uploadFile, reset };
}
