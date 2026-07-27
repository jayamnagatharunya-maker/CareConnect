import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from "react-native";
import { useRouter } from "expo-router";
import { sosApi } from "../../services/api";

export default function HomeScreen() {
  const router = useRouter();

  const handleSOS = () => {
    Alert.alert(
      "Emergency SOS",
      "Are you sure you want to send an emergency alert? This will notify your guardians and emergency contacts.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Send SOS", style: "destructive", onPress: () => router.push("/(tabs)/emergency") }
      ]
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.greeting}>Welcome to</Text>
      <Text style={styles.title}>CareConnect</Text>
      <Text style={styles.subtitle}>Your community emergency response network</Text>

      <TouchableOpacity style={styles.sosButton} onPress={handleSOS}>
        <Text style={styles.sosText}>SOS</Text>
        <Text style={styles.sosSub}>Tap for Emergency</Text>
      </TouchableOpacity>

      <View style={styles.row}>
        <TouchableOpacity style={styles.card} onPress={() => router.push("/(tabs)/contacts")}>
          <Text style={styles.cardIcon}>👥</Text>
          <Text style={styles.cardText}>Contacts</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.card} onPress={() => router.push("/(tabs)/profile")}>
          <Text style={styles.cardIcon}>👤</Text>
          <Text style={styles.cardText}>Profile</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.secondary} onPress={() => router.push("/(tabs)/notifications")}>
        <Text style={styles.secondaryIcon}>🔔</Text>
        <Text style={styles.secondaryText}>View Alerts</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>CareConnect v0.1.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, gap: 20, alignItems: "center", backgroundColor: "#f3f4f6", minHeight: "100%" },
  greeting: { fontSize: 16, color: "#6b7280", marginTop: 12 },
  title: { fontSize: 32, fontWeight: "bold", color: "#111827" },
  subtitle: { fontSize: 14, color: "#6b7280", textAlign: "center", marginBottom: 8 },
  sosButton: { width: 220, height: 220, borderRadius: 110, backgroundColor: "#dc2626", justifyContent: "center", alignItems: "center", shadowColor: "#dc2626", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 },
  sosText: { color: "white", fontSize: 56, fontWeight: "bold" },
  sosSub: { color: "rgba(255,255,255,0.9)", fontSize: 14, marginTop: 4 },
  row: { flexDirection: "row", gap: 16, width: "100%" },
  card: { flex: 1, padding: 20, backgroundColor: "white", borderRadius: 16, alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  cardIcon: { fontSize: 32, marginBottom: 8 },
  cardText: { color: "#111827", fontWeight: "600", fontSize: 16 },
  secondary: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 8, padding: 16, backgroundColor: "white", borderRadius: 16, width: "100%", shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  secondaryIcon: { fontSize: 24 },
  secondaryText: { color: "#111827", fontWeight: "600", fontSize: 16 },
  footer: { marginTop: 24 },
  footerText: { color: "#9ca3af", fontSize: 12 },
});
