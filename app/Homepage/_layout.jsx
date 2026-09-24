import { Tabs } from "expo-router";
import { View, Image, Platform } from "react-native";

import homeIcon from "../../assets/HomepageIcon.png";
import streaksIcon from "../../assets/StreaksIcon.png";
import elevationIcon from "../../assets/MountainIcon.png";
import journalIcon from "../../assets/journalicon.png";

const ACTIVE = "#A78BFA";
const INACTIVE = "#334155";

function TabIcon({ source, color, focused, size = 24 }) {
  return (
    <View className="items-center justify-center">
      {focused && (
        <View
          className="absolute rounded-full"
          style={{
            top: -8,
            width: 24,
            height: 3,
            backgroundColor: ACTIVE,
            shadowColor: ACTIVE,
            shadowOpacity: 0.8,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 0 },
            elevation: 6,
          }}
        />
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
          backgroundColor: "#0B1121",
          height: Platform.OS === "ios" ? 88 : 68,
          paddingTop: 8,
          paddingBottom: Platform.OS === "ios" ? 28 : 8,
          borderTopWidth: 1,
          borderTopColor: "rgba(255,255,255,0.04)",
          shadowColor: "#7C3AED",
          shadowOpacity: 0.15,
          shadowOffset: { width: 0, height: -8 },
          shadowRadius: 20,
          elevation: 12,
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
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon source={homeIcon} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="streaks"
        options={{
          title: "Streaks",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon source={streaksIcon} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="journal"
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
