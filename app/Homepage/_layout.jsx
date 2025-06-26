import { Tabs } from "expo-router";
import { Image } from "react-native";

import homeIcon from "../../assets/HomepageIcon.png";
import streaksIcon from "../../assets/StreaksIcon.png";
import elevationIcon from "../../assets/ElevationIcon.png"; 

const _layout = () => {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "black",
        tabBarInactiveTintColor: "gray",
      }}
    >

      <Tabs.Screen
        name="elevation"
        options={{
          title: "Elevation",
          tabBarIcon: ({ color }) => (
            <Image
              source={elevationIcon}
              style={{ width: 24, height: 24, tintColor: color }}
            />
          ),
        }}
      />
      
      <Tabs.Screen
        name="maindb"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <Image
              source={homeIcon}
              style={{ width: 24, height: 24, tintColor: color }}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="streaksdb"
        options={{
          title: "Streaks",
          tabBarIcon: ({ color }) => (
            <Image
              source={streaksIcon}
              style={{ width: 24, height: 24, tintColor: color }}
            />
          ),
        }}
      />

      
    </Tabs>
  );
};

export default _layout;




