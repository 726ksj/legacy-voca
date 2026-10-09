import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, Text, View } from "react-native";
import { router } from "expo-router";
import { supabase } from "../../lib/supabase";
import { colors } from "../../lib/theme";
import ScreenHeader from "../../components/ScreenHeader";
import EmptyState from "../../components/EmptyState";

interface TestResult {
  id: string;
  score: number;
  total_count: number;
  correct_count: number;
  tested_at: string;
  vocab_sets: { title: string } | null;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

export default function ResultsScreen() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      router.replace("/login");
      return;
    }

    const { data } = await supabase
      .from("vocab_test_results")
      .select("id, score, total_count, correct_count, tested_at, vocab_sets(title)")
      .order("tested_at", { ascending: false })
      .returns<TestResult[]>();

    setResults(data ?? []);
  }, []);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  if (loading) {
    return (
      <View className="flex-1 bg-blush">
        <ScreenHeader title="학습 결과" />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.brand} />
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-blush">
      <ScreenHeader title="학습 결과" />
      <ScrollView
        contentContainerClassName="px-6 pb-10"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brand} />
        }
      >
        <Text className="mt-6 text-sm text-ink-soft">단어 테스트 기록이에요</Text>

        <View className="mt-4 gap-3">
          {results.length === 0 && (
            <EmptyState
              icon="stats-chart-outline"
              title="아직 테스트 기록이 없어요"
              description="단어 테스트를 마치면 점수가 여기에 쌓여요"
            />
          )}

          {results.map((r) => (
            <View
              key={r.id}
              className="rounded-3xl border border-line bg-white px-5 py-4 shadow-sm shadow-brand/20"
            >
              <View className="flex-row items-center justify-between">
                <Text className="flex-1 text-base font-bold text-ink">
                  {r.vocab_sets?.title ?? "단어 테스트"}
                </Text>
                <View className="rounded-full bg-cream px-3 py-1">
                  <Text className="text-sm font-extrabold text-berry">{r.score}점</Text>
                </View>
              </View>
              <Text className="mt-1 text-xs text-ink-soft">
                {r.correct_count}/{r.total_count}개 정답 · {formatDate(r.tested_at)}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
