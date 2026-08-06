import { useState, useEffect } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";

import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import { societyApi, authApi, profileApi } from "../../services/api";
import { useAuth } from "../../hooks/useAuth";

export default function ProfileSetupScreen() {
  const [societies, setSocieties] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [flats, setFlats] = useState([]);
  const [societyId, setSocietyId] = useState("");
  const [blockId, setBlockId] = useState("");
  const [flatId, setFlatId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
  if (authLoading) return;

  societyApi
    .list({})
    .then((res) => {
      console.log("SOCIETIES RESPONSE:", res.data);
      setSocieties(res.data.results || res.data);
    })
    .catch((err) => {
      console.log("SOCIETIES ERROR:", err);
      console.log("STATUS:", err.response?.status);
      console.log("DATA:", err.response?.data);

      Alert.alert(
        "Society Error",
        JSON.stringify(err.response?.data ?? err.message)
      );
    })
    .finally(() => {
      setLoading(false);
    });
}, [authLoading]);

  useEffect(() => {
    if (societyId) {
      societyApi
  .blocks({ society_id: societyId })
  .then((res) => {
    console.log("BLOCKS:", res.data);
    setBlocks(res.data.results || res.data);
  })
  .catch((err) => {
    console.log("BLOCK ERROR:", err.response?.data);
  });
    }
  }, [societyId]);

  useEffect(() => {
    if (blockId) {
      societyApi
  .flats({ block_id: blockId })
  .then((res) => {
  console.log("FLATS RESPONSE:", JSON.stringify(res.data));

  const data = res.data.results || res.data;

  console.log("SETTING FLATS:", JSON.stringify(data));

  setFlats(data);
})
  .catch((err) => {
    console.log("FLAT ERROR:", err.response?.data);
  });
    }
  }, [blockId]);

  const handleSave = async () => {
  console.log("SAVE BUTTON CLICKED");

  try {
    setSaving(true);

    const res = await profileApi.save({
      flat: Number(flatId),
    });

    console.log("PROFILE SAVED:", res.data);

    console.log("BEFORE ALERT");

    alert("Profile saved successfully");

    console.log("AFTER ALERT");

    router.replace("/(tabs)");

  } catch (err: any) {
    console.log("SAVE ERROR:", err);

    alert(JSON.stringify(err.response?.data ?? err.message));
  } finally {
    setSaving(false);
  }
};
const handleLogout = async () => {
  try {
    await authApi.logout();

    globalThis.accessToken = null;
    globalThis.refreshToken = null;

    Alert.alert("Success", "Logged out successfully");

    router.replace("/login");
  } catch (error) {
    Alert.alert("Error", "Logout failed");
  }
};

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading societies...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile Setup</Text>
      <Text style={styles.subtitle}>Welcome, {user?.email}</Text>
      <Text style={styles.subtitle}>Select your society, block, and flat.</Text>

      <View style={styles.field}>
        <Text style={styles.label}>Society *</Text>
        <View style={styles.pickerContainer}>
          <Picker selectedValue={societyId}onValueChange={(v) => {
  console.log("SELECTED SOCIETY:", v);
  setSocietyId(String(v));
  setBlockId("");
  setFlatId("");
}}>
            <Picker.Item label="Select society" value="" />
            {societies.map((s) => <Picker.Item key={s.id} label={s.name} value={String(s.id)} />)}
          </Picker>
        </View>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Block / Tower *</Text>
        <View style={styles.pickerContainer}>
          <Picker
  selectedValue={blockId}
  onValueChange={(v) => {
    console.log("SELECTED BLOCK:", v);
    setBlockId(String(v));
    setFlatId("");
  }}
  enabled={!!societyId}
>
            <Picker.Item label="Select block" value="" />
            {blocks.map((b) => <Picker.Item key={b.id} label={b.name} value={String(b.id)} />)}
          </Picker>
        </View>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Flat *</Text>
        <View style={styles.pickerContainer}>
          <Picker
          mode="dropdown"
  selectedValue={flatId}
  onValueChange={(v) => {
    console.log("SELECTED FLAT:", v);
    setFlatId(String(v));
  }}
  enabled={!!blockId}
>
            <Picker.Item label="Select flat" value="" />
            {flats.map((f: any) => {
  console.log("Rendering flat:", JSON.stringify(f));

  return (
    <Picker.Item
      key={String(f.id)}
      label={String(f.flat_number)}
      value={String(f.id)}
    />
  );
})}
          </Picker>
        </View>
      </View>

      {saving ? (
  <ActivityIndicator size="small" color="#2563eb" />
) : (
  <>
    <Button
      title="Save Profile"
      onPress={handleSave}
    />

    <View style={{ marginTop: 15 }}>
      <Button
        title="Logout"
        color="red"
        onPress={handleLogout}
      />
    </View>
  </>
)}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, gap: 16, backgroundColor: "#f3f4f6" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", gap: 12 },
  loadingText: { color: "#6b7280", marginTop: 8 },
  title: { fontSize: 24, fontWeight: "bold" },
  subtitle: { color: "#6b7280", marginBottom: 8 },
  field: { marginTop: 4 },
  label: { marginBottom: 6, fontWeight: "600", fontSize: 15 },
  pickerContainer: { borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 10, overflow: "hidden", backgroundColor: "white" },
});
