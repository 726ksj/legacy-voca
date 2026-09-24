import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { supabase } from "../lib/supabase";

const EMAIL_DOMAIN = "legacyedu.local";
const SAVED_USERNAME_KEY = "legacy-voca:saved-username";

function FormInput({
  label,
  focused,
  ...props
}: React.ComponentProps<typeof TextInput> & {
  label: string;
  focused: boolean;
}) {
  return (
    <View className="gap-2">
      <Text className="text-xs font-bold uppercase tracking-wider text-zinc-400">
        {label}
      </Text>
      <TextInput
        placeholderTextColor="#a1a1aa"
        className={`rounded-2xl bg-zinc-100 px-4 py-4 text-base text-zinc-900 border-2 ${
          focused ? "border-brand bg-white" : "border-transparent"
        }`}
        {...props}
      />
    </View>
  );
}

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberId, setRememberId] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<"username" | "password" | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(SAVED_USERNAME_KEY).then((saved) => {
      if (saved) {
        setUsername(saved);
        setRememberId(true);
      }
    });
  }, []);

  const handleLogin = async () => {
    if (!username || !password) {
      setError("아이디와 비밀번호를 입력해주세요.");
      return;
    }

    setLoading(true);
    setError(null);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: `${username}@${EMAIL_DOMAIN}`,
      password,
    });

    if (signInError) {
      setError("아이디 또는 비밀번호가 올바르지 않습니다.");
      setLoading(false);
      return;
    }

    if (rememberId) {
      await AsyncStorage.setItem(SAVED_USERNAME_KEY, username);
    } else {
      await AsyncStorage.removeItem(SAVED_USERNAME_KEY);
    }

    setLoading(false);
    router.replace("/words");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1 bg-white"
    >
      <ScrollView
        contentContainerClassName="flex-grow"
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        <View className="overflow-hidden rounded-b-[40px]">
          <LinearGradient
            colors={["#f0a8b4", "#e05770"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ paddingTop: insets.top + 28, paddingBottom: 64 }}
          >
            <View className="items-center">
              <View className="h-28 w-28 items-center justify-center rounded-3xl bg-white/95 shadow-lg">
                <Image
                  source={require("../assets/images/logo.webp")}
                  className="h-20 w-20 rounded-xl"
                  resizeMode="contain"
                />
              </View>
              <Text className="mt-5 text-2xl font-extrabold text-white">
                Legacy Voca
              </Text>
              <Text className="mt-1.5 text-sm font-medium text-white/80">
                매일 쌓는 단어의 힘
              </Text>
            </View>
          </LinearGradient>
        </View>

        <View className="-mt-8 flex-1 rounded-t-[32px] bg-white px-6 pb-10 pt-9 shadow-2xl">
          <Text className="text-sm text-zinc-500">
            아이디와 비밀번호로 로그인해주세요
          </Text>

          <View className="mt-6 gap-5">
            <FormInput
              label="아이디"
              value={username}
              onChangeText={setUsername}
              onFocus={() => setFocusedField("username")}
              onBlur={() => setFocusedField(null)}
              focused={focusedField === "username"}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="username"
              returnKeyType="next"
            />

            <FormInput
              label="비밀번호"
              value={password}
              onChangeText={setPassword}
              onFocus={() => setFocusedField("password")}
              onBlur={() => setFocusedField(null)}
              focused={focusedField === "password"}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="current-password"
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />

            <Pressable
              onPress={() => setRememberId((v) => !v)}
              className="flex-row items-center justify-between py-1"
            >
              <Text className="text-sm font-medium text-zinc-600">
                아이디 저장
              </Text>
              <Switch
                value={rememberId}
                onValueChange={setRememberId}
                trackColor={{ true: "#e98998" }}
              />
            </Pressable>

            {error && (
              <View className="rounded-xl bg-red-50 px-4 py-3">
                <Text className="text-sm font-semibold text-red-500">
                  {error}
                </Text>
              </View>
            )}

            <Pressable
              onPress={handleLogin}
              disabled={loading}
              style={({ pressed }) => ({
                opacity: loading ? 0.7 : pressed ? 0.85 : 1,
              })}
              className="mt-2 items-center rounded-2xl bg-brand py-4 shadow-md shadow-brand/40"
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-base font-bold text-white">로그인</Text>
              )}
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
