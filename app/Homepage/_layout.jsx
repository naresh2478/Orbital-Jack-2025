import { Tabs } from "expo-router";
import { View, Image, Platform } from "react-native";

import homeIcon from "../../assets/HomepageIcon.png";
import streaksIcon from "../../assets/StreaksIcon.png";
import elevationIcon from "../../assets/MountainIcon.png";
import journalIcon from "../../assets/journalicon.png";

const ACTIVE = "#6366F1";
const INACTIVE = "#94A3B8";

function TabIcon({ source, color, focused, size = 24 }) {
  return (
    <View style={{ alignItems: "center", justifyContent: "center" }}>
      {focused && (
        <View style={{
          position: "absolute",
          top: -8,
          width: 20,
          height: 3,
          borderRadius: 2,
          backgroundColor: ACTIVE,
        }} />
      )}
      <Image
        source={source}
        style={{
          width: size,
          height: size,
          tintColor: color,
          marginTop: focused ? 2 : 0,
        }}
      />
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: ACTIVE,
        tabBarInactiveTintColor: INACTIVE,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          marginTop: 2,
        },
        tabBarStyle: {
          backgroundColor: "white",
          height: Platform.OS === "ios" ? 88 : 68,
          paddingTop: 8,
          paddingBottom: Platform.OS === "ios" ? 28 : 8,
          borderTopWidth: 0,
          shadowColor: "#000",
          shadowOpacity: 0.08,
          shadowOffset: { width: 0, height: -4 },
          shadowRadius: 12,
          elevation: 10,
        },
      }}
    >
      <Tabs.Screen
        name="elevation"
        options={{
          title: "Elevation",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon source={elevationIcon} color={color} focused={focused} size={28} />
          ),
        }}
      />
      <Tabs.Screen
        name="maindb"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon source={homeIcon} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="streaksdb"
        options={{
          title: "Streaks",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon source={streaksIcon} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="journaltab"
        options={{
          title: "Journal",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon source={journalIcon} color={color} focused={focused} size={22} />
          ),
        }}
      />
    </Tabs>
  );
}
