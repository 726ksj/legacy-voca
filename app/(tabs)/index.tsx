import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../lib/supabase";
import { fetchVocabOverview } from "../../lib/vocab";
import { StudyCardList } from "../../components/StudyCards";
import { colors } from "../../lib/theme";
import ScreenHeader from "../../components/ScreenHeader";

export default function HomeScreen() {
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
      <View className="flex-1 bg-blush">
        <ScreenHeader title="LEGACY M" />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.brand} />
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-blush">
      <ScreenHeader
        title="LEGACY M"
        right={
          <Pressable
            onPress={() => Alert.alert("알림", "새 알림이 없습니다.")}
            hitSlop={8}
            className="h-9 w-9 items-center justify-center rounded-full bg-white/25"
          >
            <Ionicons name="notifications-outline" size={20} color="white" />
          </Pressable>
        }
      />

      <ScrollView
        contentContainerClassName="px-6 pb-10"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brand} />
        }
      >
        <Text className="mt-6 text-2xl font-extrabold text-ink">
          안녕하세요, {name ?? "회원"}님
        </Text>
        <Text className="mt-1 text-sm text-ink-soft">이번 주 학습을 이어가 볼까요?</Text>

        <View className="mt-6 rounded-3xl border border-line bg-white px-5 py-5 shadow-sm shadow-brand/20">
          <View className="flex-row items-center justify-between">
            <Text className="text-sm font-bold text-ink">이번 주 진행률</Text>
            <Text className="text-sm font-extrabold text-berry">{progressPct}%</Text>
          </View>
          <View className="mt-3 h-2.5 w-full rounded-full bg-blush">
            <View className="h-2.5 rounded-full bg-brand" style={{ width: `${progressPct}%` }} />
          </View>
          <Text className="mt-3 text-xs text-ink-soft">
            {totalSets === 0
              ? "아직 배정된 단어장이 없어요"
              : `단어장 ${totalSets}개 중 ${testedSetCount}개 완료`}
          </Text>
        </View>

        <Text className="mb-3 mt-8 text-sm font-bold text-ink-soft">학습 유형</Text>
        <StudyCardList totalSets={totalSets} testedSetCount={testedSetCount} />
      </ScrollView>
    </View>
  );
}
