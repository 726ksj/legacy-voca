import { supabase } from "./supabase";

export interface TestRound {
  attempt_id: string;
  round_no: number;
  status: "in_progress" | "completed";
  total_count: number;
  correct_count: number | null;
  score: number | null;
}

export interface TestStatus {
  rounds: TestRound[];
  next_round: number | null;
  first_score: number | null;
  final_score: number | null;
  total_score: number | null;
}

export interface AttemptQuestion {
  position: number;
  word: string;
  choices: string[];
  selected_index: number | null;
  is_correct: boolean | null;
  // 답한 문항에만 내려온다(서버가 미리 알려주지 않는다).
  correct_index: number | null;
  example: string | null;
}

export interface Attempt {
  id: string;
  vocab_set_id: string;
  round_no: number;
  status: "in_progress" | "completed";
  total_count: number;
  correct_count: number | null;
  score: number | null;
  questions: AttemptQuestion[];
}

export interface AnswerResult {
  is_correct: boolean;
  correct_index: number;
  finished: boolean;
}

export const ROUND_TITLE: Record<number, string> = {
  1: "1회 · 랜덤 테스트",
  2: "2회 · 틀린 단어만",
  3: "3회 · 랜덤 재시험",
};

async function rpc<T>(fn: string, args: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.rpc(fn, args);
  if (error) throw new Error(error.message);
  return data as T;
}

export const getTestStatus = (vocabSetId: string) =>
  rpc<TestStatus>("get_vocab_test_status", { p_vocab_set_id: vocabSetId });

export const startAttempt = (vocabSetId: string) =>
  rpc<string>("start_vocab_attempt", { p_vocab_set_id: vocabSetId });

export const getAttempt = (attemptId: string) =>
  rpc<Attempt>("get_vocab_attempt", { p_attempt_id: attemptId });

export const answerQuestion = (attemptId: string, position: number, selectedIndex: number) =>
  rpc<AnswerResult>("answer_vocab_question", {
    p_attempt_id: attemptId,
    p_position: position,
    p_selected_index: selectedIndex,
  });

// DB 함수가 던지는 영문 메시지를 학생에게 보여줄 문구로 바꾼다.
export function friendlyTestError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  if (message.includes("at least 4 distinct meanings")) {
    return "이 단어장은 서로 다른 뜻의 단어가 4개 이상 있어야 테스트할 수 있어요.";
  }
  if (message.includes("no further round")) {
    return "이미 모든 회차를 마쳤어요.";
  }
  if (message.includes("not assigned")) {
    return "이 단어장은 지금 볼 수 없어요.";
  }
  return "테스트를 불러오지 못했어요. 잠시 후 다시 시도해주세요.";
}
