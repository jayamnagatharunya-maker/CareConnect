import { useState, useEffect } from "react";
import { View, Text, Button, StyleSheet, Alert, ActivityIndicator, Picker } from "react-native";
import { useRouter } from "expo-router";
import { societyApi } from "../../services/api";
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
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    societyApi.list().then((res) => {
      setSocieties(res.data.results || res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (societyId) {
      societyApi.blocks({ society_id: societyId }).then((res) => setBlocks(res.data.results || res.data));
    }
  }, [societyId]);

  useEffect(() => {
    if (blockId) {
      societyApi.flats({ block_id: blockId }).then((res) => setFlats(res.data.results || res.data));
    }
  }, [blockId]);

  const handleSave = async () => {
    if (!societyId || !blockId || !flatId) {
      Alert.alert("Validation", "Please select society, block, and flat");
      return;
    }
    setSaving(true);
    try {
      const flat = flats.find(f => String(f.id) === flatId);
      Alert.alert("Success", `Profile setup saved.\nSociety: ${societies.find(s => String(s.id) === societyId)?.name}\nFlat: ${flat?.flat_number}`);
      router.replace("/(tabs)");
    } catch {
      Alert.alert("Error", "Failed to save profile");
    } finally {
      setSaving(false);
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
          <Picker selectedValue={societyId} onValueChange={(v) => { setSocietyId(v); setBlockId(""); setFlatId(""); }}>
            <Picker.Item label="Select society" value="" />
            {societies.map((s) => <Picker.Item key={s.id} label={s.name} value={String(s.id)} />)}
          </Picker>
        </View>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Block / Tower *</Text>
        <View style={styles.pickerContainer}>
          <Picker selectedValue={blockId} onValueChange={(v) => { setBlockId(v); setFlatId(""); }} enabled={!!societyId}>
            <Picker.Item label="Select block" value="" />
            {blocks.map((b) => <Picker.Item key={b.id} label={b.name} value={String(b.id)} />)}
          </Picker>
        </View>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Flat *</Text>
        <View style={styles.pickerContainer}>
          <Picker selectedValue={flatId} onValueChange={setFlatId} enabled={!!blockId}>
            <Picker.Item label="Select flat" value="" />
            {flats.map((f) => <Picker.Item key={f.id} label={f.flat_number} value={String(f.id)} />)}
          </Picker>
        </View>
      </View>

      {saving ? (
        <ActivityIndicator size="small" color="#2563eb" />
      ) : (
        <Button title="Save Profile" onPress={handleSave} />
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
