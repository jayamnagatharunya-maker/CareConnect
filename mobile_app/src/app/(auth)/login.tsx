import { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../hooks/useAuth";
import { registerDeviceToken } from "../../hooks/usePushNotifications";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
  console.log("BUTTON PRESSED");

  if (!email || !password) {
    console.log("EMPTY FIELDS");
    setError("Please enter email and password");
    return;
  }

  setLoading(true);
  setError("");

  try {
    console.log("CALLING LOGIN...");
    await login(email, password);
    console.log("LOGIN SUCCESS");
    console.log("TOKEN AFTER LOGIN:", globalThis.accessToken);
    await registerDeviceToken();
    console.log("Navigating to tabs...");
    router.replace("/(tabs)" as any);
  } catch (e: any) {
    console.log("LOGIN FAILED", e);
    Alert.alert(
      "Login Error",
      JSON.stringify(e.response?.data ?? e.message)
    );
  } finally {
    console.log("FINALLY");
    setLoading(false);
  }
};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>CareConnect</Text>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {loading ? (
        <ActivityIndicator size="large" color="#2563eb" />
      ) : (
        <Button
  title="Sign In"
  onPress={handleLogin}
/>
      )}
      <Button title="Register" onPress={() => router.push("/(auth)/register")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24, gap: 12 },
  title: { fontSize: 28, fontWeight: "bold", textAlign: "center", marginBottom: 24 },
  input: { borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 8, padding: 12, fontSize: 16 },
  error: { color: "red", textAlign: "center", marginBottom: 8 },
  input: {
  backgroundColor: "white",
  borderWidth: 1,
  borderColor: "#ddd",
  borderRadius: 10,
  padding: 12,
  marginBottom: 20,
  minHeight: 80,
  textAlignVertical: "top",
},
});
