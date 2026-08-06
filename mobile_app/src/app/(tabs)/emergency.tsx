import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import { sosApi } from "../../services/api";
import * as Location from "expo-location";

export default function EmergencyScreen() {
  const router = useRouter();
  const { loading: authLoading } = useAuth();

  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    if (authLoading) return;

    sosApi
      .categories()
      .then((res) => {
        setCategories(res.data.results || res.data);
      })
      .catch((err) => console.log(err))
      .finally(() => setLoading(false));
  }, [authLoading]);

  const handleCategory = async (categoryId: number) => {
    if (sending) return;

    setSending(true);

    try {
      const { status } =
        await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Location permission is required."
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({});

      const latitude = location.coords.latitude.toFixed(6);
      const longitude = location.coords.longitude.toFixed(6);
      const result = await Location.reverseGeocodeAsync({
  latitude: Number(latitude),
  longitude: Number(longitude),
});

if (result.length > 0) {
  const place = result[0];

  const fullAddress = `${place.name ?? ""}, ${place.street ?? ""}, ${place.city ?? ""}, ${place.region ?? ""}`;

  setAddress(fullAddress);

  console.log("ADDRESS:", fullAddress);
}
      console.log("Latitude:", latitude);
      console.log("Longitude:", longitude);

      const res = await sosApi.create({
        category: categoryId,
        message: message || "Emergency SOS",
        latitude,
        longitude,
      });

      console.log("SOS RESPONSE:", res.data);

      Alert.alert("Success", "SOS Sent Successfully");

      // Go back to Home tab
      router.replace("/");
    } catch (e: any) {
      console.log("STATUS:", e.response?.status);
      console.log(
        "FULL ERROR:",
        JSON.stringify(e.response?.data, null, 2)
      );

      Alert.alert(
        "Error",
        JSON.stringify(e.response?.data ?? e.message, null, 2)
      );
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#dc2626" />
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Emergency Categories</Text>

      <Text style={styles.subtitle}>
        Select the type of emergency
      </Text>

      <TextInput
        placeholder="Describe your emergency (optional)"
        value={message}
        onChangeText={setMessage}
        multiline
        style={styles.input}
      />

      <FlatList
        data={categories}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <TouchableOpacity
            disabled={sending}
            style={[
              styles.item,
              sending && { opacity: 0.5 },
            ]}
            onPress={() => handleCategory(item.id)}
          >
            <View style={styles.itemIcon}>
              <Text style={styles.iconText}>!</Text>
            </View>

            <View style={styles.itemContent}>
              <Text style={styles.text}>{item.name}</Text>
              <Text style={styles.sub}>
                {item.description}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#f3f4f6",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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

  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    minHeight: 80,
    marginBottom: 20,
    textAlignVertical: "top",
  },

  item: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: "center",
    elevation: 2,
  },

  itemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fee2e2",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  iconText: {
    fontSize: 20,
    color: "#dc2626",
    fontWeight: "bold",
  },

  itemContent: {
    flex: 1,
  },

  text: {
    fontSize: 18,
    fontWeight: "600",
  },

  sub: {
    color: "#6b7280",
    marginTop: 4,
  },
});