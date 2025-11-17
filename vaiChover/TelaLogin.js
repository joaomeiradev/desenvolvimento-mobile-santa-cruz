import { useState } from "react";
import { View, TextInput, Text, Alert, StyleSheet, Image, TouchableOpacity, ImageBackground } from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase";

const logo = require('./assets/imagemLogo.png');
const fundo = require('./assets/fundo.jpg');

export default function TelaLogin({ navigation }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  async function handleLogin() {
    if (!email.trim() || !senha.trim()) {
        Alert.alert("Erro de Preenchimento", "Por favor, preencha seu Email e Senha para continuar.");
        return;
    }
    
    try {
      await signInWithEmailAndPassword(auth, email, senha);
      navigation.replace("TelaHome");
    } catch (error) {
      let errorMessage = "Erro ao entrar. Tente novamente."; 
      if (error.code === 'auth/user-not-found') {
          errorMessage = "Conta não encontrada. Por favor, verifique seu e-mail ou cadastre-se.";
      } 
      else if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
          errorMessage = "Email ou senha incorretos. Por favor, verifique seus dados.";
      } else {
        errorMessage = error.message; 
      }
      
      Alert.alert("Erro de Login", errorMessage);
    }
  }

  return (
    <ImageBackground source={fundo} style={styles.container} resizeMode="cover">
      <View style={styles.contentBox}> 
        <Image source={logo} style={styles.logoImage} resizeMode="contain" />

        <Text style={styles.label}>Email</Text>
        <TextInput 
          value={email} 
          onChangeText={setEmail} 
          style={styles.input} 
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Text style={styles.label}>Senha</Text>
        <TextInput 
          value={senha} 
          onChangeText={setSenha} 
          secureTextEntry 
          style={styles.input} 
        />

        <TouchableOpacity style={styles.customButton} onPress={handleLogin}>
          <Text style={styles.customButtonText}>Entrar</Text>
        </TouchableOpacity>
        
        <View style={{ marginTop: 15, width: '100%' }}>
          <TouchableOpacity style={styles.customButton} onPress={() => navigation.navigate("TelaCadastro")}>
            <Text style={styles.customButtonText}>Não tem conta? Cadastre-se</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
    container: { padding: 20, flex: 1, alignItems: 'center', justifyContent: 'center' },
    contentBox: { 
        padding: 20,
        width: '90%', 
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 10,
        alignItems: 'center'
    },
    logoImage: { width: '100%', height: 200, marginBottom: 30 },
    label: { alignSelf: 'flex-start', marginLeft: 5, marginTop: 10, fontWeight: 'bold', color: '#708c9f' },
    input: { borderWidth: 1, borderColor: '#ccc', padding: 10, width: '100%', marginBottom: 10, borderRadius: 5, backgroundColor: 'white' },
    customButton: {
      backgroundColor: '#708c9f',
      padding: 10,
      borderRadius: 5,
      marginVertical: 5,
      width: '100%',
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