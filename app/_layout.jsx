import  { Tabs } from "expo-router";
import { Image} from "react-native";
import homeIcon from "../assets/aaron.png";

const _layout = () => {
  return (
    <Tabs> 
        <Tabs.Screen
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
            options={{ title: "Streaks" }}
        />
    </Tabs>


  )
}

export default _layout

