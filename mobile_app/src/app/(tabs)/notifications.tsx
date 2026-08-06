import { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  Button,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from "react-native";
import { notificationsApi } from "../../services/api";

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const res = await notificationsApi.list();
      setNotifications(res.data.results || res.data);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleRead = async (id) => {
    try {
      await notificationsApi.markRead(id);
      load();
    } catch {
      Alert.alert("Error", "Failed to mark as read");
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading alerts...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Alerts</Text>
      <FlatList
        data={notifications}
        keyExtractor={(item) => String(item.id)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={<Text style={styles.empty}>No notifications yet</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.item, !item.is_read && styles.unread]}
            onPress={() => !item.is_read && handleRead(item.id)}
          >
            <View style={styles.itemHeader}>
              <Text style={styles.titleText}>{item.title}</Text>
              {!item.is_read && <View style={styles.unreadDot} />}
            </View>
            <Text style={styles.body}>{item.body}</Text>
            <Text style={styles.time}>{new Date(item.sent_at).toLocaleString()}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f3f4f6" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", gap: 12 },
  loadingText: { color: "#6b7280", marginTop: 8 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 16 },
  empty: { textAlign: "center", color: "#6b7280", marginTop: 32, fontSize: 16 },
  item: { padding: 16, backgroundColor: "white", borderRadius: 12, marginBottom: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  unread: { borderLeftWidth: 4, borderLeftColor: "#2563eb" },
  itemHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  titleText: { fontSize: 16, fontWeight: "600", flex: 1 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#2563eb" },
  body: { color: "#4b5563", fontSize: 14, lineHeight: 20, marginBottom: 8 },
  time: { color: "#9ca3af", fontSize: 12 },
});
