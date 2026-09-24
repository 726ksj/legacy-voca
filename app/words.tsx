import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { supabase } from "../lib/supabase";

interface VocabSet {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
}

interface Course {
  id: string;
  subject: string;
  title: string;
  teacher_name: string;
}

interface AssignmentRow {
  assigned_at: string;
  vocab_sets: VocabSet | null;
  courses: Course | null;
}

interface CourseGroup {
  key: string;
  label: string;
  sets: (VocabSet & { wordCount: number })[];
}

export default function WordsScreen() {
  const insets = useSafeAreaInsets();
  const [groups, setGroups] = useState<CourseGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      router.replace("/login");
      return;
    }

    const { data: assignmentRows, error: fetchError } = await supabase
      .from("vocab_assignments")
      .select("assigned_at, vocab_sets(id, title, description, created_at), courses(id, subject, title, teacher_name)")
      .order("assigned_at", { ascending: false })
      .returns<AssignmentRow[]>();

    if (fetchError) {
      setError("단어장을 불러오지 못했습니다.");
      return;
    }

    const rows = (assignmentRows ?? []).filter((row) => row.vocab_sets !== null);
    const vocabSetIds = rows.map((row) => row.vocab_sets!.id);

    const { data: wordRows } = vocabSetIds.length
      ? await supabase
          .from("vocab_words")
          .select("vocab_set_id")
          .in("vocab_set_id", vocabSetIds)
      : { data: [] as { vocab_set_id: string }[] };

    const wordCountBySet = new Map<string, number>();
    for (const row of wordRows ?? []) {
      wordCountBySet.set(row.vocab_set_id, (wordCountBySet.get(row.vocab_set_id) ?? 0) + 1);
    }

    const groupMap = new Map<string, CourseGroup>();
    for (const row of rows) {
      const set = row.vocab_sets!;
      const course = row.courses;
      const key = course ? course.id : "personal";
      const label = course
        ? `[${course.subject}] ${course.title}`
        : "개인 배정 단어장";

      if (!groupMap.has(key)) {
        groupMap.set(key, { key, label, sets: [] });
      }
      groupMap.get(key)!.sets.push({ ...set, wordCount: wordCountBySet.get(set.id) ?? 0 });
    }

    setGroups(Array.from(groupMap.values()));
  }, []);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  return (
    <View className="flex-1 bg-white">
      <View className="overflow-hidden rounded-b-[32px]">
        <LinearGradient
          colors={["#f0a8b4", "#e05770"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ paddingTop: insets.top + 16, paddingBottom: 28 }}
        >
          <View className="flex-row items-center justify-between px-6">
            <View>
              <Text className="text-xl font-extrabold text-white">내 단어장</Text>
              <Text className="mt-1 text-xs font-medium text-white/80">
                수강 중인 반에 배정된 단어장이에요
              </Text>
            </View>
            <Pressable
              onPress={handleLogout}
              className="rounded-full bg-white/20 px-4 py-2"
            >
              <Text className="text-xs font-semibold text-white">로그아웃</Text>
            </Pressable>
          </View>
        </LinearGradient>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#e98998" />
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerClassName="px-6 py-6 gap-8"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#e98998" />
          }
        >
          {error && (
            <View className="rounded-xl bg-red-50 px-4 py-3">
              <Text className="text-sm font-semibold text-red-500">{error}</Text>
            </View>
          )}

          {!error && groups.length === 0 && (
            <View className="items-center py-20">
              <Text className="text-sm text-zinc-400">
                아직 배정된 단어장이 없습니다.
              </Text>
            </View>
          )}

          {groups.map((group) => (
            <View key={group.key} className="gap-3">
              <Text className="text-sm font-bold text-zinc-500">{group.label}</Text>

              <View className="gap-3">
                {group.sets.map((set) => (
                  <View
                    key={set.id}
                    className="rounded-2xl border border-zinc-100 bg-white px-4 py-4 shadow-sm"
                  >
                    <View className="flex-row items-center justify-between">
                      <Text className="flex-1 text-base font-bold text-zinc-900">
                        {set.title}
                      </Text>
                      <View className="rounded-full bg-brand-light px-3 py-1">
                        <Text className="text-xs font-bold text-brand-dark">
                          {set.wordCount}개
                        </Text>
                      </View>
                    </View>
                    {set.description && (
                      <Text className="mt-1 text-xs text-zinc-400">
                        {set.description}
                      </Text>
                    )}
                  </View>
                ))}
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
