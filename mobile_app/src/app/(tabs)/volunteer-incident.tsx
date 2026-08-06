import { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useAuth } from "../../hooks/useAuth";
import { sosApi } from "../../services/api";

export default function VolunteerIncidentScreen() {
  const { user, loading: authLoading } = useAuth();
  const [sosAlerts, setSosAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadSos = async () => {
    try {
      const res = await sosApi.list({ status: "pending" });
      setSosAlerts(res.data.results || res.data);
    } catch (error: any) {
      console.log("LOAD SOS ERROR:", error.response?.data ?? error.message);
      Alert.alert("Error", "Failed to load SOS alerts.");
      setSosAlerts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    loadSos();
  }, [authLoading]);

  const handleMarkResponding = async (id: number) => {
    try {
      await sosApi.updateStatus(id, "acknowledged");
      Alert.alert("Responding", "You have marked this SOS as responding.");
      loadSos();
    } catch (error: any) {
      console.log("RESPOND ERROR:", error.response?.data ?? error.message);
      Alert.alert("Error", "Failed to mark SOS as responding.");
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadSos();
  };

  if (authLoading || loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#16a34a" />
        <Text style={styles.loadingText}>Loading volunteer incidents...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Volunteer Incidents</Text>
      <Text style={styles.subtitle}>
        {user?.role === "volunteer"
          ? "See pending SOS incidents and acknowledge that you are responding."
          : "This screen is for volunteers only."}
      </Text>

      <FlatList
        data={sosAlerts}
        keyExtractor={(item) => String(item.id)}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListEmptyComponent={
          <Text style={styles.empty}>No pending incidents available.</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.category}>{item.category?.name || "SOS"}</Text>
              <Text style={styles.status}>{item.status}</Text>
            </View>
            <Text style={styles.message}>{item.message || "No details available."}</Text>
            {item.address ? <Text style={styles.address}>{item.address}</Text> : null}
            <Text style={styles.meta}>Created: {new Date(item.created_at).toLocaleString()}</Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => handleMarkResponding(item.id)}
            >
              <Text style={styles.buttonText}>Mark Responding</Text>
            </TouchableOpacity>
          </View>
        )}
      />
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
    marginTop: 12,
    color: "#6b7280",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    color: "#6b7280",
    marginBottom: 16,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  category: {
    fontWeight: "700",
    fontSize: 16,
  },
  status: {
    color: "#16a34a",
    fontWeight: "700",
    textTransform: "capitalize",
  },
  message: {
    color: "#374151",
    marginBottom: 8,
  },
  address: {
    color: "#6b7280",
    marginBottom: 8,
  },
  meta: {
    color: "#9ca3af",
    marginBottom: 14,
    fontSize: 12,
  },
  button: {
    backgroundColor: "#16a34a",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },
  empty: {
    marginTop: 40,
    textAlign: "center",
    color: "#6b7280",
  },
});