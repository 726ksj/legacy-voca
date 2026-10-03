import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { supabase } from "../../lib/supabase";

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      router.replace("/login");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("name, username")
      .eq("id", session.user.id)
      .single();

    setName(profile?.name ?? null);
    setUsername(profile?.username ?? null);
  }, []);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [load]);

  const handleLogout = () => {
    Alert.alert("로그아웃", "로그아웃 하시겠어요?", [
      { text: "취소", style: "cancel" },
      {
        text: "로그아웃",
        style: "destructive",
        onPress: async () => {
          await supabase.auth.signOut();
          router.replace("/login");
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator color="#e98998" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      <View className="px-6 pt-2">
        <Text className="text-2xl font-extrabold text-zinc-900">설정</Text>

        <View className="mt-6 border border-zinc-100 bg-zinc-50 px-5 py-5">
          <Text className="text-base font-bold text-zinc-900">{name ?? "회원"}</Text>
          {username && <Text className="mt-1 text-sm text-zinc-500">@{username}</Text>}
        </View>

        <Pressable
          onPress={handleLogout}
          style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
          className="mt-8 items-center border border-zinc-200 py-4"
        >
          <Text className="text-sm font-bold text-red-500">로그아웃</Text>
        </Pressable>
      </View>
    </View>
  );
}
