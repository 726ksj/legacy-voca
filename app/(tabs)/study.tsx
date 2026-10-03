import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, Text, View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { supabase } from "../../lib/supabase";
import { fetchVocabOverview } from "../../lib/vocab";
import { StudyCardList } from "../../components/StudyCards";

export default function StudyScreen() {
  const insets = useSafeAreaInsets();
  const [totalSets, setTotalSets] = useState(0);
  const [testedSetCount, setTestedSetCount] = useState(0);
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

    const overview = await fetchVocabOverview();
    setTotalSets(overview.totalSets);
    setTestedSetCount(overview.testedSetCount);
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
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator color="#e98998" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      <ScrollView
        contentContainerClassName="px-6 pb-10"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#e98998" />
        }
      >
        <Text className="mt-2 text-2xl font-extrabold text-zinc-900">학습</Text>
        <Text className="mt-1 text-sm text-zinc-500">원하는 학습 유형을 선택하세요</Text>

        <View className="mt-6">
          <StudyCardList totalSets={totalSets} testedSetCount={testedSetCount} />
        </View>
      </ScrollView>
    </View>
  );
}
