import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, Text, View } from "react-native";
import { router, Stack } from "expo-router";
import { supabase } from "../lib/supabase";
import { fetchVocabOverview, type VocabGroup } from "../lib/vocab";

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
    <View className="flex-1 bg-white">
      <Stack.Screen options={{ headerShown: true, title: "단어 학습", headerBackTitle: "뒤로" }} />

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
            <View className="bg-red-50 px-4 py-3">
              <Text className="text-sm font-semibold text-red-500">{error}</Text>
            </View>
          )}

          {!error && groups.length === 0 && (
            <View className="items-center py-20">
              <Text className="text-sm text-zinc-400">아직 배정된 단어장이 없습니다.</Text>
            </View>
          )}

          {groups.map((group) => (
            <View key={group.key} className="gap-3">
              <Text className="text-sm font-bold text-zinc-500">{group.label}</Text>

              <View className="gap-3">
                {group.sets.map((set) => (
                  <View
                    key={set.id}
                    className="border border-zinc-100 bg-white px-4 py-4 shadow-sm"
                  >
                    <View className="flex-row items-center justify-between">
                      <Text className="flex-1 text-base font-bold text-zinc-900">
                        {set.title}
                      </Text>
                      <View className="bg-brand-light px-3 py-1">
                        <Text className="text-xs font-bold text-brand-dark">
                          {set.wordCount}개
                        </Text>
                      </View>
                    </View>
                    {set.description && (
                      <Text className="mt-1 text-xs text-zinc-400">{set.description}</Text>
                    )}
                    {set.lastScore !== null && (
                      <Text className="mt-1 text-xs text-zinc-400">
                        최근 점수 {set.lastScore}점
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
