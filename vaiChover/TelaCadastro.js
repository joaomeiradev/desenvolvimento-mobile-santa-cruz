import { useState } from "react";
import { View, TextInput, Text, Alert, StyleSheet, Image, TouchableOpacity, ImageBackground } from "react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { ref, set } from "firebase/database"; 
import { auth, database } from "./firebase"; 

const logo = require('./assets/imagemLogo.png');
const fundo = require('./assets/fundo.jpg');

export default function TelaCadastro({ navigation }) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const criarCadastro = () => {
    if (!nome.trim() || !email.trim() || !senha.trim()) {
        return Alert.alert("Erro de Preenchimento", "Por favor, preencha todos os campos (Nome, Email e Senha) para se cadastrar.");
    }

    createUserWithEmailAndPassword(auth, email, senha)
      .then(async userCredential => { 
          const user = userCredential.user;
          console.log('Cadastrado', user.email);

          await set(ref(database, 'users/' + user.uid + '/profile'), {
            name: nome,
          });

          Alert.alert("Sucesso!", "Cadastro realizado. Faça login agora.");
          navigation.navigate('TelaLogin');
      })
      .catch(error => {
          Alert.alert('Erro no Cadastro', error.message);
      });
  }

  return (
    <ImageBackground source={fundo} style={styles.container} resizeMode="cover">
      <View style={styles.contentBox}>
        <Image source={logo} style={styles.logoImage} resizeMode="contain" />

        <Text style={styles.label}>Nome</Text>
        <TextInput value={nome} onChangeText={setNome} style={styles.input} />

        <Text style={styles.label}>Email</Text>
        <TextInput value={email} onChangeText={setEmail} style={styles.input} />

        <Text style={styles.label}>Senha</Text>
        <TextInput value={senha} onChangeText={setSenha} secureTextEntry style={styles.input} />

        <TouchableOpacity style={styles.customButton} onPress={criarCadastro}>
          <Text style={styles.customButtonText}>Cadastrar</Text>
        </TouchableOpacity>
        
        <View style={{ marginTop: 15, width: '100%' }}>
          <TouchableOpacity style={styles.customButton} onPress={() => navigation.navigate("TelaLogin")}>
            <Text style={styles.customButtonText}>Já tem conta? Entrar</Text>
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