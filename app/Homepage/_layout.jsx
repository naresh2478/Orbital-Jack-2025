import  { Tabs } from "expo-router";
import { Image} from "react-native";
import homeIcon from "../../assets/HomepageIcon.png";
import streaksIcon from "../../assets/StreaksIcon.png";

const _layout = () => {
  return (
    <Tabs //creates tab navigation 
        screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: "black",
            tabBarInactiveTintColor: "gray",
        }}
    > 
        <Tabs.Screen //edit tab screen
            name="main"
            options={{ 
                title: "Home",
                tabBarIcon: ({ color }) => (
                    <Image source={homeIcon} style={{ width: 24, height: 24, tintColor: color }} />
                )
            }}
        />
        <Tabs.Screen
            name="streaks"
            options={{ 
                title: "Streaks",
                tabBarIcon: ( {color}) => (
                    <Image source={streaksIcon} style={{ width: 24, height: 24, tintColor: color}} />
                )
            }}
        />
    </Tabs>


  )
}

export default _layout




