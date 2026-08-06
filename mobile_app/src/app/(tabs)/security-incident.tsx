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

export default function SecurityIncidentScreen() {
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

  const handleMarkResolved = async (id: number) => {
    try {
      await sosApi.updateStatus(id, "resolved");
      Alert.alert("Resolved", "SOS incident marked as resolved.");
      loadSos();
    } catch (error: any) {
      console.log("RESOLVE ERROR:", error.response?.data ?? error.message);
      Alert.alert("Error", "Failed to resolve SOS incident.");
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadSos();
  };

  if (authLoading || loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#dc2626" />
        <Text style={styles.loadingText}>Loading security incidents...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Security Incidents</Text>
      <Text style={styles.subtitle}>
        {user?.role === "security"
          ? "Monitor pending SOS alerts and mark incidents resolved when handled."
          : "This screen is for security personnel only."}
      </Text>

      <FlatList
        data={sosAlerts}
        keyExtractor={(item) => String(item.id)}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListEmptyComponent={
          <Text style={styles.empty}>No pending security incidents.</Text>
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
              onPress={() => handleMarkResolved(item.id)}
            >
              <Text style={styles.buttonText}>Mark Resolved</Text>
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
    color: "#dc2626",
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
    backgroundColor: "#dc2626",
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