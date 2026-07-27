import { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Alert } from "react-native";
import { useRouter } from "expo-router";
import { sosApi } from "../../services/api";

export default function EmergencyScreen() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    sosApi.categories().then((res) => {
      setCategories(res.data.results || res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleCategory = async (categoryId) => {
    try {
      await sosApi.create({ category: categoryId, message: "Emergency SOS from mobile app", latitude: 12.9716, longitude: 77.5946, address: "Bangalore" });
      Alert.alert("SOS Sent", "Your emergency alert has been sent to guardians.", [
        { text: "OK", onPress: () => router.replace("/(tabs)") }
      ]);
    } catch {
      Alert.alert("Error", "Failed to send SOS. Please try again.");
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#dc2626" />
        <Text style={styles.loadingText}>Loading categories...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Emergency Categories</Text>
      <Text style={styles.subtitle}>Select the type of emergency:</Text>
      <FlatList
        data={categories}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>No categories available</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.item} onPress={() => handleCategory(item.id)}>
            <View style={styles.itemIcon}>
              <Text style={styles.iconText}>!</Text>
            </View>
            <View style={styles.itemContent}>
              <Text style={styles.text}>{item.name}</Text>
              <Text style={styles.sub}>{item.description}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: "#f3f4f6" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", gap: 12 },
  loadingText: { color: "#6b7280", marginTop: 8 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 8 },
  subtitle: { color: "#6b7280", marginBottom: 16 },
  list: { gap: 12 },
  empty: { textAlign: "center", color: "#6b7280", marginTop: 32, fontSize: 16 },
  item: { flexDirection: "row", alignItems: "center", padding: 16, backgroundColor: "white", borderRadius: 12, marginBottom: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  itemIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#fef2f2", justifyContent: "center", alignItems: "center", marginRight: 12 },
  iconText: { color: "#dc2626", fontWeight: "bold", fontSize: 20 },
  itemContent: { flex: 1 },
  text: { fontSize: 18, fontWeight: "600" },
  sub: { color: "#6b7280", marginTop: 4 },
});
