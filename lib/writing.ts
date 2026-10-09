import { supabase } from "./supabase";

export interface WritingSetItem {
  id: string;
  title: string;
  week: number | null;
  sentenceCount: number;
}

export interface WritingGroup {
  key: string;
  label: string;
  sets: WritingSetItem[];
}

export interface WritingSentence {
  id: string;
  order_no: number;
  english: string;
  korean: string;
  // 정답 문장을 나눈 배열 단위(순서대로).
  chunks: string[];
  // 강사가 표시한 핵심 어구(chunks 중 일부).
  key_phrases: string[];
}

interface SetRow {
  id: string;
  title: string;
  week: number | null;
  created_at: string;
  courses: { id: string; subject: string; title: string } | null;
  writing_sentences: { count: number }[];
}

// 수강 중인 강좌의 서술형 세트를 강좌별로 묶어서 가져온다. 숨긴 세트와 수강하지
// 않는 강좌의 세트는 RLS가 걸러준다.
export async function fetchWritingGroups(): Promise<WritingGroup[]> {
  const { data, error } = await supabase
    .from("writing_sets")
    .select(
      "id, title, week, created_at, courses(id, subject, title), writing_sentences(count)",
    )
    .order("week", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: true })
    .returns<SetRow[]>();
  if (error) throw new Error(error.message);

  const groups = new Map<string, WritingGroup>();
  for (const row of data ?? []) {
    const course = row.courses;
    const key = course ? course.id : "etc";
    const label = course ? `[${course.subject}] ${course.title}` : "서술형";
    if (!groups.has(key)) groups.set(key, { key, label, sets: [] });
    groups.get(key)!.sets.push({
      id: row.id,
      title: row.title,
      week: row.week,
      sentenceCount: row.writing_sentences[0]?.count ?? 0,
    });
  }
  return Array.from(groups.values());
}

export async function fetchWritingSet(setId: string): Promise<{
  title: string;
  sentences: WritingSentence[];
}> {
  const [
    { data: set, error: setError },
    { data: sentences, error: sentencesError },
  ] = await Promise.all([
    supabase.from("writing_sets").select("title").eq("id", setId).maybeSingle(),
    supabase
      .from("writing_sentences")
      .select("id, order_no, english, korean, chunks, key_phrases")
      .eq("writing_set_id", setId)
      .order("order_no", { ascending: true })
      .returns<WritingSentence[]>(),
  ]);
  if (setError || sentencesError) {
    throw new Error((setError ?? sentencesError)!.message);
  }
  if (!set) throw new Error("not found");
  return { title: set.title, sentences: sentences ?? [] };
}
