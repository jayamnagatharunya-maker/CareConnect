import { useState, useEffect } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert, ActivityIndicator, FlatList, TouchableOpacity } from "react-native";
import { emergencyApi } from "../../services/api";

export default function EmergencyContactsScreen() {
  const [contacts, setContacts] = useState([]);
  const [form, setForm] = useState({ name: "", phone_number: "", email: "", relation: "" });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const res = await emergencyApi.contacts();
      setContacts(res.data.results || res.data);
      setError("");
    } catch {
      setError("Failed to load contacts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    if (!form.name || !form.phone_number) {
      Alert.alert("Validation", "Name and phone are required");
      return;
    }
    setSubmitting(true);
    try {
      await emergencyApi.createContact(form);
      setForm({ name: "", phone_number: "", email: "", relation: "" });
      await load();
      Alert.alert("Success", "Contact added successfully");
    } catch {
      Alert.alert("Error", "Failed to add contact");
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerify = async (id) => {
    try {
      await emergencyApi.verifyContact(id);
      await load();
      Alert.alert("Success", "Contact verified");
    } catch {
      Alert.alert("Error", "Verification failed");
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading contacts...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Emergency Contacts</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <FlatList
        data={contacts}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <View style={styles.itemHeader}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={[
                styles.statusBadge,
                item.verification_status === "verified" ? styles.verified : styles.pending
              ]}>
                {item.verification_status}
              </Text>
            </View>
            <Text style={styles.detail}>{item.phone_number}</Text>
            {item.email ? <Text style={styles.detail}>{item.email}</Text> : null}
            {item.verification_status !== "verified" && (
              <TouchableOpacity style={styles.verifyButton} onPress={() => handleVerify(item.id)}>
                <Text style={styles.verifyText}>Verify Contact</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No emergency contacts yet</Text>}
      />
      <View style={styles.form}>
        <Text style={styles.formTitle}>Add New Contact</Text>
        <TextInput placeholder="Name *" value={form.name} onChangeText={(t) => setForm({ ...form, name: t })} style={styles.input} />
        <TextInput placeholder="Phone *" value={form.phone_number} onChangeText={(t) => setForm({ ...form, phone_number: t })} style={styles.input} />
        <TextInput placeholder="Email" value={form.email} onChangeText={(t) => setForm({ ...form, email: t })} style={styles.input} />
        <TextInput placeholder="Relation" value={form.relation} onChangeText={(t) => setForm({ ...form, relation: t })} style={styles.input} />
        {submitting ? (
          <ActivityIndicator size="small" color="#2563eb" />
        ) : (
          <Button title="Add Contact" onPress={handleAdd} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", gap: 12 },
  loadingText: { color: "#6b7280", marginTop: 8 },
  title: { fontSize: 22, fontWeight: "bold" },
  error: { color: "red", textAlign: "center" },
  item: { padding: 16, backgroundColor: "#f9fafb", borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: "#e5e7eb" },
  itemHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  name: { fontSize: 16, fontWeight: "600" },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, fontSize: 12, fontWeight: "600" },
  verified: { backgroundColor: "#dcfce7", color: "#16a34a" },
  pending: { backgroundColor: "#fef3c7", color: "#d97706" },
  detail: { color: "#6b7280", fontSize: 14, marginBottom: 4 },
  verifyButton: { marginTop: 8, padding: 10, backgroundColor: "#2563eb", borderRadius: 8, alignItems: "center" },
  verifyText: { color: "white", fontWeight: "600" },
  empty: { textAlign: "center", color: "#6b7280", marginTop: 24 },
  form: { marginTop: 16, gap: 10, padding: 16, backgroundColor: "white", borderRadius: 12, borderWidth: 1, borderColor: "#e5e7eb" },
  formTitle: { fontSize: 16, fontWeight: "600", marginBottom: 8 },
  input: { borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 8, padding: 12, fontSize: 16 },
});
