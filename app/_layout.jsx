import  { Tabs } from "expo-router";
import { Image} from "react-native";
import homeIcon from "../assets/HomepageIcon.png";
import streaksIcon from "../assets/StreaksIcon.png";

const _layout = () => {
  return (
    <Tabs> //creates tab navigation 
        <Tabs.Screen //edit tab screen
            name="index"
            options={{ 
                title: "Home",
                tabBarIcon: () => (
                    <Image source={homeIcon} style={{ width: 24, height: 24 }} />
                )
            }}
        />
        <Tabs.Screen
            name="streaks"
            options={{ 
                title: "Streaks",
                tabBarIcon: () => (
                    <Image source={streaksIcon} style={{ width: 24, height: 24 }} />
                )
            }}
        />
    </Tabs>


  )
}

export default _layout




