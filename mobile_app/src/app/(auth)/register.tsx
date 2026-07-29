import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ActivityIndicator,
} from "react-native";

import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import { useAuth } from "../../hooks/useAuth";

export default function RegisterScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("resident");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const router = useRouter();

  const handleRegister = async () => {
    if (!email || !password) {
      setError("Please fill all fields");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await login(email, password);
      router.replace("/(tabs)");
    } catch (e: any) {
  console.log("LOGIN ERROR:", e.response?.data);
  console.log("STATUS:", e.response?.status);

  Alert.alert(
    "Login Error",
    JSON.stringify(e.response?.data ?? e.message)
  );
}finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" style={styles.input} />
      <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />
      <TextInput placeholder="Confirm Password" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry style={styles.input} />
      <View style={styles.pickerContainer}>
        <Text style={styles.label}>Role</Text>
        <Picker selectedValue={role} onValueChange={setRole} style={styles.picker}>
          <Picker.Item label="Resident" value="resident" />
          <Picker.Item label="Guardian" value="guardian" />
          <Picker.Item label="Volunteer" value="volunteer" />
          <Picker.Item label="Security" value="security" />
        </Picker>
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {loading ? (
        <ActivityIndicator size="large" color="#2563eb" />
      ) : (
        <Button title="Register" onPress={handleRegister} />
      )}
      <Button title="Back to Login" onPress={() => router.back()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24, gap: 12 },
  title: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 24 },
  input: { borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 8, padding: 12, fontSize: 16 },
  pickerContainer: { marginBottom: 12 },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 6 },
  picker: { borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 8 },
  error: { color: "red", textAlign: "center", marginBottom: 8 },
});
