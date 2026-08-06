import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  Button,
  ActivityIndicator,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import { useAuth } from "../../hooks/useAuth";
import { registerDeviceToken } from "../../hooks/usePushNotifications";

export default function RegisterScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [role, setRole] = useState("resident");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { register } = useAuth();
  const router = useRouter();

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword || !phoneNumber) {
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
      console.log("Sending:", {
  email,
  password,
  confirmPassword,
  phoneNumber,
  role,
});
      await register(
        email,
        password,
        confirmPassword,
        role,
        phoneNumber
      );

      await registerDeviceToken();

      Alert.alert("Success", "Registration successful!", [
  {
    text: "OK",
    onPress: () => {
  router.dismissAll();
  router.navigate("/(tabs)");
},
  },
]);
    } catch (e: any) {
  console.log("FULL ERROR:", e);
  console.log("MESSAGE:", e.message);
  console.log("CODE:", e.code);
  console.log("STATUS:", e.response?.status);
  console.log("DATA:", e.response?.data);

  Alert.alert(
    "Registration Error",
    e.response
      ? JSON.stringify(e.response.data, null, 2)
      : e.message
  );
} finally {
  setLoading(false);
}
};

return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>

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

      <TextInput
        placeholder="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        style={styles.input}
      />

      <TextInput
        placeholder="Phone Number"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        keyboardType="phone-pad"
        style={styles.input}
      />

      <View style={styles.pickerContainer}>
        <Text style={styles.label}>Role</Text>

        <Picker
          selectedValue={role}
          onValueChange={(itemValue) => setRole(itemValue)}
          style={styles.picker}
        >
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

      <View style={{ marginTop: 10 }}>
        <Button
          title="Back to Login"
          onPress={() => router.back()}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  pickerContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
  },
  picker: {
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  error: {
    color: "red",
    textAlign: "center",
    marginBottom: 12,
  },
});