import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

const CARD_COLORS = {
  vocab: { bg: "#e9f7f1", fg: "#1f8a5f" },
  sentence: { bg: "#fbeaf0", fg: "#c23d64" },
  order: { bg: "#eaf1fb", fg: "#2f5fa8" },
  grammar: { bg: "#f1eafb", fg: "#6c3fa8" },
};

interface VocabCardProps {
  totalSets: number;
  testedSetCount: number;
}

function ComingSoonCard({
  title,
  subtitle,
  colors,
}: {
  title: string;
  subtitle: string;
  colors: { bg: string; fg: string };
}) {
  return (
    <View
      className="border border-zinc-100 px-5 py-4 opacity-60"
      style={{ backgroundColor: colors.bg }}
    >
      <View className="flex-row items-center justify-between">
        <Text className="text-base font-bold" style={{ color: colors.fg }}>
          {title}
        </Text>
        <View className="border border-zinc-300 px-2 py-0.5">
          <Text className="text-[10px] font-bold text-zinc-500">준비 중</Text>
        </View>
      </View>
      <Text className="mt-1 text-xs text-zinc-500">{subtitle}</Text>
    </View>
  );
}

export function VocabStudyCard({ totalSets, testedSetCount }: VocabCardProps) {
  const colors = CARD_COLORS.vocab;
  const statusText =
    totalSets === 0 ? "학습할 단어장 없음" : `${testedSetCount} / ${totalSets}개 완료`;

  return (
    <Pressable
      onPress={() => router.push("/vocab")}
      style={({ pressed }) => ({
        backgroundColor: colors.bg,
        opacity: pressed ? 0.85 : 1,
      })}
      className="border border-zinc-100 px-5 py-4"
    >
      <View className="flex-row items-center justify-between">
        <Text className="text-base font-bold" style={{ color: colors.fg }}>
          단어 학습
        </Text>
        <View className="flex-row items-center gap-1">
          <Text className="text-xs font-bold text-zinc-500">{statusText}</Text>
          <Ionicons name="chevron-forward" size={16} color="#71717a" />
        </View>
      </View>
      <Text className="mt-1 text-xs text-zinc-500">단어를 암기하고 테스트해요</Text>
    </Pressable>
  );
}

export function StudyCardList({ totalSets, testedSetCount }: VocabCardProps) {
  return (
    <View className="gap-3">
      <VocabStudyCard totalSets={totalSets} testedSetCount={testedSetCount} />
      <ComingSoonCard
        title="문장 학습"
        subtitle="문장을 암기하고 배열해요"
        colors={CARD_COLORS.sentence}
      />
      <ComingSoonCard
        title="순서 배열"
        subtitle="지문과 문장의 순서를 맞춰요"
        colors={CARD_COLORS.order}
      />
      <ComingSoonCard
        title="어법 학습"
        subtitle="문맥에 맞는 어법을 선택해요"
        colors={CARD_COLORS.grammar}
      />
    </View>
  );
}
