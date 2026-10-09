import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import { router } from "expo-router";
import { supabase } from "../lib/supabase";
import { fetchVocabOverview, type VocabGroup } from "../lib/vocab";
import { colors } from "../lib/theme";
import ScreenHeader from "../components/ScreenHeader";
import EmptyState from "../components/EmptyState";

export default function VocabScreen() {
  const [groups, setGroups] = useState<VocabGroup[]>([]);
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

    try {
      const overview = await fetchVocabOverview();
      setGroups(overview.groups);
    } catch {
      setError("단어장을 불러오지 못했습니다.");
    }
  }, []);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  return (
    <View className="flex-1 bg-blush">
      <ScreenHeader title="단어 학습" back />

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.brand} />
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerClassName="px-6 py-6 gap-8"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brand} />
          }
        >
          {error && (
            <View className="rounded-xl bg-red-50 px-4 py-3">
              <Text className="text-sm font-semibold text-red-500">{error}</Text>
            </View>
          )}

          {!error && groups.length === 0 && (
            <EmptyState
              icon="book-outline"
              title="아직 배정된 단어장이 없어요"
              description="강사님이 단어장을 배정하면 여기에 나타나요"
            />
          )}

          {groups.map((group) => (
            <View key={group.key} className="gap-3">
              <Text className="text-sm font-bold text-ink-soft">{group.label}</Text>

              <View className="gap-3">
                {group.sets.map((set) => (
                  <Pressable
                    key={set.id}
                    onPress={() => router.push(`/test/${set.id}`)}
                    style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
                    className="rounded-3xl border border-line bg-white px-5 py-4 shadow-sm shadow-brand/20"
                  >
                    <View className="flex-row items-center justify-between">
                      <Text className="flex-1 text-base font-bold text-ink">
                        {set.title}
                      </Text>
                      <View className="rounded-full bg-cream px-3 py-1">
                        <Text className="text-xs font-bold text-berry">
                          {set.wordCount}개
                        </Text>
                      </View>
                    </View>
                    {set.description && (
                      <Text className="mt-1 text-xs text-ink-soft">{set.description}</Text>
                    )}
                    {set.lastScore !== null && (
                      <Text className="mt-1 text-xs text-ink-soft">
                        최근 점수 {set.lastScore}점
                      </Text>
                    )}
                    <Text className="mt-2 text-xs font-bold text-brand-dark">
                      {set.lastScore !== null ? "다시 보기 ›" : "테스트 시작 ›"}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
