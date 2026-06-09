"use client";
import { useState } from "react";

export type PlayState = "playing" | "submitted-correct" | "submitted-wrong";

const MOCK_CORRECT_ANSWER = "5";

export function useQuestPlay() {
  const [state, setState] = useState<PlayState>("playing");
  const [answer, setAnswer] = useState("");

  /** 채점 후 정답 여부를 반환 — 호출부(view)가 영속화 분기에 사용. */
  function submit(): boolean {
    const isCorrect = answer.trim() === MOCK_CORRECT_ANSWER;
    setState(isCorrect ? "submitted-correct" : "submitted-wrong");
    return isCorrect;
  }

  function reset() {
    setState("playing");
    setAnswer("");
  }

  return { state, answer, setAnswer, submit, reset };
}
