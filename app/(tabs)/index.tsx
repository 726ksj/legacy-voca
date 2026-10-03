import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { supabase } from "../../lib/supabase";
import { fetchVocabOverview } from "../../lib/vocab";
import { StudyCardList } from "../../components/StudyCards";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState<string | null>(null);
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

    const [{ data: profile }, overview] = await Promise.all([
      supabase.from("profiles").select("name").eq("id", session.user.id).single(),
      fetchVocabOverview(),
    ]);

    setName(profile?.name ?? null);
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

  const progressPct = totalSets === 0 ? 0 : Math.round((testedSetCount / totalSets) * 100);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator color="#e98998" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <LinearGradient
        colors={["#f0a8b4", "#e05770"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ paddingTop: insets.top + 20, paddingBottom: 28 }}
      >
        <View className="relative flex-row items-center justify-center px-6">
          <Text className="text-xl font-extrabold text-white">LEGACY M</Text>
          <Pressable
            onPress={() => Alert.alert("알림", "새 알림이 없습니다.")}
            className="absolute right-6"
          >
            <Ionicons name="notifications-outline" size={22} color="white" />
          </Pressable>
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerClassName="px-6 pb-10"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#e98998" />
        }
      >
        <Text className="mt-6 text-2xl font-extrabold text-zinc-900">
          안녕하세요, {name ?? "회원"}님
        </Text>
        <Text className="mt-1 text-sm text-zinc-500">이번 주 학습을 이어가 볼까요?</Text>

        <View className="mt-6 border border-zinc-100 bg-zinc-50 px-5 py-5">
          <View className="flex-row items-center justify-between">
            <Text className="text-sm font-bold text-zinc-700">이번 주 진행률</Text>
            <Text className="text-sm font-extrabold text-brand-dark">{progressPct}%</Text>
          </View>
          <View className="mt-3 h-2 w-full bg-zinc-200">
            <View className="h-2 bg-brand" style={{ width: `${progressPct}%` }} />
          </View>
          <Text className="mt-3 text-xs text-zinc-500">
            {totalSets === 0
              ? "아직 배정된 단어장이 없어요"
              : `단어장 ${totalSets}개 중 ${testedSetCount}개 완료`}
          </Text>
        </View>

        <Text className="mb-3 mt-8 text-sm font-bold text-zinc-500">학습 유형</Text>
        <StudyCardList totalSets={totalSets} testedSetCount={testedSetCount} />
      </ScrollView>
    </View>
  );
}
