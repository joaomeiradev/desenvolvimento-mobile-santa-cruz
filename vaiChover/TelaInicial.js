import { View, Text, StyleSheet, Image, TouchableOpacity, ImageBackground } from "react-native";
import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";

const logo = require('./assets/imagemLogo.png');
const fundo = require('./assets/fundo.jpg');

export default function TelaInicial({ navigation }) {
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
        if (user) {
            navigation.replace("TelaHome");
        }
    });

    return unsubscribe;
  }, []);
    
  return (
    <ImageBackground source={fundo} style={styles.container} resizeMode="cover">
      <Image source={logo} style={styles.logoImage} resizeMode="contain" />

      <TouchableOpacity style={styles.customButton} onPress={() => navigation.navigate("TelaLogin")}>
        <Text style={styles.customButtonText}>Login</Text>
      </TouchableOpacity>
      <View style={{ height: 10 }} />
      <TouchableOpacity style={styles.customButton} onPress={() => navigation.navigate("TelaCadastro")}>
        <Text style={styles.customButtonText}>Cadastro</Text>
      </TouchableOpacity>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" }, // O background já define o flex: 1
  logoImage: { width: '100%', height: 250, marginBottom: 40 },
  customButton: {
    backgroundColor: '#708c9f',
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
    width: '80%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  customButtonText: {
    color: '#fac824',
    fontSize: 16,
    fontWeight: 'bold',
  },
});