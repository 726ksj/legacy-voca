import { useCallback, useState } from "react";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { supabase } from "../../lib/supabase";
import { brandGradient, colors } from "../../lib/theme";
import ScreenHeader from "../../components/ScreenHeader";
import {
  friendlyTestError,
  getTestStatus,
  ROUND_TITLE,
  startAttempt,
  type TestRound,
  type TestStatus,
} from "../../lib/test";

function RoundCard({
  roundNo,
  round,
  skipped,
}: {
  roundNo: number;
  round: TestRound | undefined;
  skipped: boolean;
}) {
  let badge = "대기";
  let badgeBg = "bg-blush";
  let badgeText = "text-ink-soft";
  if (round?.status === "completed") {
    badge = `${round.score}점`;
    badgeBg = "bg-cream";
    badgeText = "text-berry";
  } else if (round?.status === "in_progress") {
    badge = "진행 중";
    badgeBg = "bg-amber-100";
    badgeText = "text-amber-700";
  } else if (skipped) {
    badge = "생략";
  }

  return (
    <View className="flex-row items-center justify-between rounded-3xl border border-line bg-white px-5 py-4 shadow-sm shadow-brand/20">
      <View className="flex-1 pr-3">
        <Text className="text-base font-bold text-ink">{ROUND_TITLE[roundNo]}</Text>
        <Text className="mt-1 text-xs text-ink-soft">
          {round
            ? `${round.correct_count ?? 0} / ${round.total_count} 정답`
            : skipped
              ? "틀린 단어가 없어 건너뛰었어요"
              : "아직 시작하지 않았어요"}
        </Text>
      </View>
      <View className={`rounded-full px-3 py-1 ${badgeBg}`}>
        <Text className={`text-xs font-bold ${badgeText}`}>{badge}</Text>
      </View>
    </View>
  );
}

export default function TestOverviewScreen() {
  const { setId } = useLocalSearchParams<{ setId: string }>();
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<TestStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [starting, setStarting] = useState(false);
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
      const [{ data: set }, nextStatus] = await Promise.all([
        supabase.from("vocab_sets").select("title").eq("id", setId).maybeSingle(),
        getTestStatus(setId),
      ]);
      setTitle(set?.title ?? "");
      setStatus(nextStatus);
    } catch (e) {
      setError(friendlyTestError(e));
    }
  }, [setId]);

  // 문제를 풀고 돌아올 때마다 최신 진행 상황을 다시 불러온다.
  useFocusEffect(
    useCallback(() => {
      load().finally(() => setLoading(false));
    }, [load]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const inProgress = status?.rounds.find((round) => round.status === "in_progress");
  const round1 = status?.rounds.find((round) => round.round_no === 1);
  const round2 = status?.rounds.find((round) => round.round_no === 2);
  const round2Skipped = round1?.status === "completed" && !round2 && status?.next_round === 3;
  const allDone = status !== null && !inProgress && status.next_round === null;

  const onPrimary = async () => {
    if (!status) return;
    if (inProgress) {
      router.push(`/attempt/${inProgress.attempt_id}`);
      return;
    }
    setStarting(true);
    setError(null);
    try {
      const attemptId = await startAttempt(setId);
      router.push(`/attempt/${attemptId}`);
    } catch (e) {
      setError(friendlyTestError(e));
    } finally {
      setStarting(false);
    }
  };

  const primaryLabel = inProgress
    ? `${inProgress.round_no}회 이어서 풀기`
    : status?.next_round
      ? status.rounds.length === 0
        ? "테스트 시작"
        : `${status.next_round}회 시작`
      : "";

  return (
    <View className="flex-1 bg-blush">
      <ScreenHeader title="단어 테스트" back />

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.brand} />
        </View>
      ) : (
        <ScrollView
          contentContainerClassName="px-6 py-6 gap-6"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brand} />
          }
        >
          <View>
            <Text className="text-xl font-extrabold text-ink">{title || "단어장"}</Text>
            <Text className="mt-1 text-xs text-ink-soft">
              4지선다 · 답을 고르면 바로 확정되고 수정할 수 없어요
            </Text>
          </View>

          {error && (
            <View className="rounded-xl bg-red-50 px-4 py-3">
              <Text className="text-sm font-semibold text-red-500">{error}</Text>
            </View>
          )}

          {status && (
            <>
              <View className="gap-3">
                {[1, 2, 3].map((roundNo) => (
                  <RoundCard
                    key={roundNo}
                    roundNo={roundNo}
                    round={status.rounds.find((round) => round.round_no === roundNo)}
                    skipped={roundNo === 2 && round2Skipped}
                  />
                ))}
              </View>

              {allDone ? (
                <LinearGradient
                  colors={brandGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ borderRadius: 28, paddingHorizontal: 22, paddingVertical: 22 }}
                >
                  <Text className="text-xs font-bold text-cream">테스트 완료</Text>
                  <Text className="mt-1 text-3xl font-extrabold text-white">
                    종합 {status.total_score}점
                  </Text>
                  <Text className="mt-2 text-xs text-white/80">
                    1회 {status.first_score}점 × 40% + 최종 {status.final_score}점 × 60%
                  </Text>
                </LinearGradient>
              ) : (
                <Pressable
                  onPress={onPrimary}
                  disabled={starting}
                  style={({ pressed }) => ({ opacity: pressed || starting ? 0.8 : 1 })}
                  className="items-center rounded-2xl bg-brand py-4 shadow-md shadow-brand/40"
                >
                  {starting ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Text className="text-base font-bold text-white">{primaryLabel}</Text>
                  )}
                </Pressable>
              )}
            </>
          )}
        </ScrollView>
      )}
    </View>
  );
}
