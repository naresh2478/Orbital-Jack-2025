import { StyleSheet, Text, View, Image } from 'react-native'
import Logo from '../assets/aaron.png';
const Home = () => {
  return (
    <View style={styles.containers}>
      <Image source={Logo} style={styles.logo} />

      <Text style = {styles.title}>Home</Text>

      <Text style = {{ marginTop: 10, marginBottom: 30}}>
        Goat
      </Text>
      
    </View>
  )
}

export default Home

const styles = StyleSheet.create({
  containers: {
    flex: 1, 
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  logo: {
    width: 350,
    height: 350,
    resizeMode: 'contain',
    marginBottom: 20,
  },
})