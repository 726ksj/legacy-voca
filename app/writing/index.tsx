import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { supabase } from "../../lib/supabase";
import { colors } from "../../lib/theme";
import { fetchWritingGroups, type WritingGroup } from "../../lib/writing";
import EmptyState from "../../components/EmptyState";
import ScreenHeader from "../../components/ScreenHeader";

export default function WritingListScreen() {
  const [groups, setGroups] = useState<WritingGroup[]>([]);
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
      setGroups(await fetchWritingGroups());
    } catch {
      setError("서술형 목록을 불러오지 못했습니다.");
    }
  }, []);

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

  return (
    <View className="flex-1 bg-blush">
      <ScreenHeader title="문장 학습" back />

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.brand} />
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerClassName="px-6 py-6 gap-8"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.brand}
            />
          }
        >
          {error && (
            <View className="rounded-xl bg-red-50 px-4 py-3">
              <Text className="text-sm font-semibold text-red-500">
                {error}
              </Text>
            </View>
          )}

          {!error && groups.length === 0 && (
            <EmptyState
              icon="create-outline"
              title="아직 배정된 서술형이 없어요"
              description="강사님이 문장을 등록하면 여기에 나타나요"
            />
          )}

          {groups.map((group) => (
            <View key={group.key} className="gap-3">
              <Text className="text-sm font-bold text-ink-soft">
                {group.label}
              </Text>
              <View className="gap-3">
                {group.sets.map((set) => (
                  <Pressable
                    key={set.id}
                    onPress={() => router.push(`/writing/${set.id}`)}
                    style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
                    className="rounded-3xl border border-line bg-white px-5 py-4 shadow-sm shadow-brand/20"
                  >
                    <View className="flex-row items-center justify-between">
                      <Text className="flex-1 text-base font-bold text-ink">
                        {set.title}
                      </Text>
                      <View className="rounded-full bg-cream px-3 py-1">
                        <Text className="text-xs font-bold text-berry">
                          {set.sentenceCount}문장
                        </Text>
                      </View>
                    </View>
                    <Text className="mt-2 text-xs font-bold text-brand-dark">
                      {set.week ? `${set.week}주차 · ` : ""}문장 암기 ›
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
