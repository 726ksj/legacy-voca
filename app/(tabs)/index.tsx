import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { supabase } from "../../lib/supabase";
import { fetchVocabOverview } from "../../lib/vocab";
import { StudyCardList } from "../../components/StudyCards";
import { brandGradient, colors } from "../../lib/theme";
import { useStatusBar } from "../../lib/useStatusBar";

export default function HomeScreen() {
  useStatusBar("light");
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
      <View className="flex-1 items-center justify-center bg-blush">
        <ActivityIndicator color={colors.brand} />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-blush">
      <LinearGradient
        colors={brandGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingTop: insets.top + 20,
          paddingBottom: 32,
          borderBottomLeftRadius: 32,
          borderBottomRightRadius: 32,
        }}
      >
        <View className="relative flex-row items-center justify-center px-6">
          <Text className="text-xl font-extrabold tracking-wide text-white">LEGACY M</Text>
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
