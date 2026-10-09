import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../lib/supabase";
import { colors } from "../../lib/theme";
import { fetchWritingSet, type WritingSentence } from "../../lib/writing";
import ScreenHeader from "../../components/ScreenHeader";

// 서술형 W01 문장 암기: 우리말 → 영어 문장을 한 문장씩 넘겨 보며 외운다. 배열
// 풀이(W02)는 다음 단계에서 이어 붙인다.
export default function WritingStudyScreen() {
  const { setId } = useLocalSearchParams<{ setId: string }>();
  const [title, setTitle] = useState("");
  const [sentences, setSentences] = useState<WritingSentence[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
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
      const loaded = await fetchWritingSet(setId);
      setTitle(loaded.title);
      setSentences(loaded.sentences);
    } catch {
      setError("서술형 문장을 불러오지 못했어요.");
    }
  }, [setId]);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [load]);

  const sentence = sentences[index];
  const isFirst = index === 0;
  const isLast = index === sentences.length - 1;

  return (
    <View className="flex-1 bg-blush">
      <ScreenHeader
        title="문장 암기"
        back
        right={
          sentences.length > 0 ? (
            <View className="rounded-full bg-white/25 px-2.5 py-1">
              <Text className="text-xs font-bold text-white">
                {index + 1} / {sentences.length}
              </Text>
            </View>
          ) : undefined
        }
      />

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.brand} />
        </View>
      ) : error || !sentence ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-center text-sm font-semibold text-red-500">
            {error ?? "등록된 문장이 없어요."}
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerClassName="px-6 py-6 gap-5">
          <Text className="text-sm font-bold text-ink-soft">{title}</Text>

          <View className="h-2 rounded-full bg-white">
            <View
              className="h-2 rounded-full bg-brand"
              style={{ width: `${((index + 1) / sentences.length) * 100}%` }}
            />
          </View>

          <View className="rounded-3xl border border-line bg-white px-6 py-8 shadow-sm shadow-brand/20">
            <View className="self-start rounded-full bg-cream px-3 py-1">
              <Text className="text-xs font-bold text-berry">우리말</Text>
            </View>
            <Text className="mt-3 text-xl font-bold leading-8 text-ink">
              {sentence.korean}
            </Text>

            <View className="mt-6 self-start rounded-full bg-blush px-3 py-1">
              <Text className="text-xs font-bold text-brand-dark">
                영어 문장
              </Text>
            </View>
            <Text className="mt-3 text-2xl font-extrabold leading-9 text-ink">
              {sentence.english}
            </Text>

            <View className="mt-5 flex-row flex-wrap gap-2">
              {sentence.chunks.map((chunk, i) => {
                const isKey = sentence.key_phrases.includes(chunk);
                return (
                  <View
                    key={i}
                    className={`rounded-xl px-3 py-1.5 ${isKey ? "bg-brand" : "bg-blush"}`}
                  >
                    <Text
                      className={`text-sm font-semibold ${isKey ? "text-white" : "text-ink-soft"}`}
                    >
                      {chunk}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>

          <View className="flex-row gap-3">
            <Pressable
              onPress={() => setIndex((i) => Math.max(0, i - 1))}
              disabled={isFirst}
              style={{ opacity: isFirst ? 0.4 : 1 }}
              className="flex-1 flex-row items-center justify-center gap-1 rounded-2xl border border-line bg-white py-4"
            >
              <Ionicons name="chevron-back" size={18} color={colors.inkSoft} />
              <Text className="text-base font-bold text-ink-soft">이전</Text>
            </Pressable>
            <Pressable
              onPress={() => (isLast ? router.back() : setIndex((i) => i + 1))}
              className="flex-1 flex-row items-center justify-center gap-1 rounded-2xl bg-brand py-4 shadow-md shadow-brand/40"
            >
              <Text className="text-base font-bold text-white">
                {isLast ? "암기 완료" : "다음"}
              </Text>
              {!isLast && (
                <Ionicons name="chevron-forward" size={18} color="#ffffff" />
              )}
            </Pressable>
          </View>

          <View className="items-center rounded-2xl border border-dashed border-line bg-white/60 py-4">
            <Text className="text-sm font-semibold text-ink-soft">
              배열 연습은 준비 중이에요
            </Text>
          </View>
        </ScrollView>
      )}
    </View>
  );
}
