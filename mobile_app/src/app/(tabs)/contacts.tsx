import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { emergencyApi } from "../../services/api";

export default function EmergencyContactsScreen() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [form, setForm] = useState({
    name: "",
    phone_number: "",
    email: "",
    relation: "",
  });
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

  useEffect(() => {
    load();
  }, []);

  const handleAdd = async () => {
    if (!form.name || !form.phone_number) {
      Alert.alert("Validation", "Name and Phone Number are required");
      return;
    }

    setSubmitting(true);

    try {
      await emergencyApi.createContact(form);

      Alert.alert("Success", "Contact added successfully");

      setForm({
        name: "",
        phone_number: "",
        email: "",
        relation: "",
      });

      load();
    } catch {
      Alert.alert("Error", "Failed to add contact");
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerify = async (id: number) => {
    try {
      await emergencyApi.verifyContact(id);

      Alert.alert("Success", "Contact verified");

      load();
    } catch {
      Alert.alert("Error", "Verification failed");
    }
  };

  const handleDelete = async (id: number) => {
    Alert.alert(
      "Delete Contact",
      "Are you sure?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await emergencyApi.deleteContact(id);

              Alert.alert("Success", "Contact deleted");

              load();
            } catch {
              Alert.alert("Error", "Delete failed");
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading Contacts...</Text>
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
        ListEmptyComponent={
          <Text style={styles.empty}>
            No Emergency Contacts Found
          </Text>
        }
        renderItem={({ item }) => (
          <View style={styles.item}>
            <View style={styles.itemHeader}>
              <Text style={styles.name}>{item.name}</Text>

              <Text
                style={[
                  styles.statusBadge,
                  item.verification_status === "verified"
                    ? styles.verified
                    : styles.pending,
                ]}
              >
                {item.verification_status}
              </Text>
            </View>

            <Text style={styles.detail}>
              📞 {item.phone_number}
            </Text>

            {item.email ? (
              <Text style={styles.detail}>
                ✉ {item.email}
              </Text>
            ) : null}

            {item.relation ? (
              <Text style={styles.detail}>
                Relation: {item.relation}
              </Text>
            ) : null}

            <View style={styles.buttonRow}>
              {item.verification_status !== "verified" && (
                <TouchableOpacity
                  style={styles.verifyButton}
                  onPress={() => handleVerify(item.id)}
                >
                  <Text style={styles.buttonText}>Verify</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDelete(item.id)}
              >
                <Text style={styles.buttonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <View style={styles.form}>
        <Text style={styles.formTitle}>Add New Contact</Text>

        <TextInput
          placeholder="Name"
          value={form.name}
          onChangeText={(t) =>
            setForm({ ...form, name: t })
          }
          style={styles.input}
        />

        <TextInput
          placeholder="Phone Number"
          value={form.phone_number}
          onChangeText={(t) =>
            setForm({ ...form, phone_number: t })
          }
          style={styles.input}
        />

        <TextInput
          placeholder="Email"
          value={form.email}
          onChangeText={(t) =>
            setForm({ ...form, email: t })
          }
          style={styles.input}
        />

        <TextInput
          placeholder="Relation"
          value={form.relation}
          onChangeText={(t) =>
            setForm({ ...form, relation: t })
          }
          style={styles.input}
        />

        {submitting ? (
          <ActivityIndicator color="#2563eb" />
        ) : (
          <Button
            title="Add Contact"
            onPress={handleAdd}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f3f4f6",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    marginTop: 10,
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
  },

  error: {
    color: "red",
    marginBottom: 10,
  },

  empty: {
    textAlign: "center",
    marginTop: 30,
    color: "gray",
  },

  item: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },

  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  name: {
    fontWeight: "bold",
    fontSize: 18,
  },

  detail: {
    marginTop: 4,
    color: "#555",
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    fontSize: 12,
    fontWeight: "bold",
  },

  verified: {
    backgroundColor: "#dcfce7",
    color: "#15803d",
  },

  pending: {
    backgroundColor: "#fef3c7",
    color: "#b45309",
  },

  buttonRow: {
    flexDirection: "row",
    marginTop: 12,
  },

  verifyButton: {
    backgroundColor: "#2563eb",
    padding: 10,
    borderRadius: 8,
    marginRight: 10,
  },

  deleteButton: {
    backgroundColor: "#dc2626",
    padding: 10,
    borderRadius: 8,
  },

  buttonText: {
    color: "white",
    fontWeight: "bold",
  },

  form: {
    marginTop: 20,
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
  },

  formTitle: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 10,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
});