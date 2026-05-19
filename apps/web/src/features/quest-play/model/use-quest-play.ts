"use client";
import { useState } from "react";

export type PlayState = "playing" | "submitted-correct" | "submitted-wrong";

const MOCK_CORRECT_ANSWER = "5";

export function useQuestPlay() {
  const [state, setState] = useState<PlayState>("playing");
  const [answer, setAnswer] = useState("");

  function submit() {
    setState(answer.trim() === MOCK_CORRECT_ANSWER ? "submitted-correct" : "submitted-wrong");
  }

  function reset() {
    setState("playing");
    setAnswer("");
  }

  return { state, answer, setAnswer, submit, reset };
}
