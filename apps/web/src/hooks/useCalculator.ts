import { useReducer, useEffect, useRef } from "react";
import type { StairInput, StairResult } from "@stairs/calc";
import { calculateStairs } from "../api/client.ts";

interface State {
  input: StairInput;
  result: StairResult | null;
  loading: boolean;
  error: string | null;
}

type Action =
  | { type: "SET_FIELD"; field: keyof StairInput; value: unknown }
  | { type: "APPLY_PRESET"; input: StairInput }
  | { type: "SET_RESULT"; result: StairResult }
  | { type: "SET_ERROR"; error: string }
  | { type: "SET_LOADING" };

const defaultInput: StairInput = {
  type: "straight",
  style: "closed",
  totalRise: 2700,
  desiredStepHeight: 175,
  desiredStepDepth: 260,
  stairWidth: 1000,
  nosing: 20,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, input: { ...state.input, [action.field]: action.value } };
    case "APPLY_PRESET":
      return { ...state, input: action.input };
    case "SET_RESULT":
      return { ...state, result: action.result, loading: false, error: null };
    case "SET_ERROR":
      return { ...state, error: action.error, loading: false };
    case "SET_LOADING":
      return { ...state, loading: true, error: null };
  }
}

export function useCalculator() {
  const [state, dispatch] = useReducer(reducer, {
    input: defaultInput,
    result: null,
    loading: false,
    error: null,
  });

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      dispatch({ type: "SET_LOADING" });
      try {
        const result = await calculateStairs(state.input);
        dispatch({ type: "SET_RESULT", result });
      } catch (err) {
        dispatch({ type: "SET_ERROR", error: String(err) });
      }
    }, 300);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [state.input]);

  function setField(field: keyof StairInput, value: unknown) {
    dispatch({ type: "SET_FIELD", field, value });
  }

  function applyPreset(input: StairInput) {
    dispatch({ type: "APPLY_PRESET", input });
  }

  return { ...state, setField, applyPreset };
}
