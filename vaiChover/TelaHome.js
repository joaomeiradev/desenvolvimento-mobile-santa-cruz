import { useEffect, useState } from "react";
import { 
  ref, set, get, child 
} from "firebase/database"; 
import { 
  View, Text, TextInput, StyleSheet, Alert, ActivityIndicator, FlatList, TouchableOpacity, Image, ImageBackground 
} from "react-native"; 
import * as Location from "expo-location";
import { 
  getWeatherAndForecastByCoords, getWeatherAndForecastByCity 
} from "./tempoAPI";
import { signOut } from "firebase/auth";
import { auth, database } from "./firebase"; 

const logo = require('./assets/imagemLogo1.png');
const fundo = require('./assets/fundo.jpg');

const processWeatherData = (data, isLocal) => {
    if (!data || data.cod !== '200' || !data.list) return null;

    const current = data.list[0];
    
    const forecast = [];
    const today = new Date().getUTCDate();
    const days = {};

    data.list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const dayOfMonth = date.getUTCDate();
        const hours = date.getUTCHours();
        
        if (dayOfMonth === today) return; 

        if (!days[dayOfMonth] && hours >= 11 && hours <= 14) {
            days[dayOfMonth] = item;
            forecast.push(item);
        }
    });

    return {
        id: isLocal ? 'local' : data.city.name,
        name: data.city.name,
        isLocal: isLocal,
        current: {
            temp: current.main.temp,
            description: current.weather[0].description,
            humidity: current.main.humidity,
            windSpeed: current.wind.speed,
            feelsLike: current.main.feels_like,
            pressure: current.main.pressure,
        },
        forecast: forecast.slice(0, 3)
    };
};


export default function TelaHome({ navigation }) {
  const [climas, setClimas] = useState([]); 
  const [cidadeInput, setCidadeInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");

  const loadUserNameFromDB = async () => {
    const userId = auth.currentUser.uid;
    const dbRef = ref(database);
    
    try {
      const snapshot = await get(child(dbRef, `users/${userId}/profile/name`));
      return snapshot.exists() ? snapshot.val() : "Usuário";
    } catch (error) {
      console.error("Erro ao carregar nome do Firebase:", error);
      return "Usuário";
    }
  };

  const loadUserCitiesFromDB = async () => {
    const userId = auth.currentUser.uid;
    const dbRef = ref(database);
    
    try {
      const snapshot = await get(child(dbRef, `users/${userId}/cities`));
      return snapshot.exists() ? snapshot.val() : [];
    } catch (error) {
      console.error("Erro ao carregar cidades do Firebase:", error);
      return [];
    }
  };

  const saveUserCitiesToDB = async (citiesArray) => {
    const userId = auth.currentUser.uid;
    try {
      await set(ref(database, `users/${userId}/cities`), citiesArray);
    } catch (error) {
      console.error("Erro ao salvar cidades no Firebase:", error);
      Alert.alert("Erro de Sincronização", "Não foi possível salvar suas cidades.");
    }
  };
  
  const updateClimasList = async (localRawData, savedCityNames) => {
    const listaDeClima = [];
    setLoading(true);

    const localProcessed = processWeatherData(localRawData, true);

    if (localProcessed) {
      listaDeClima.push(localProcessed);
    }

    const buscasPromises = savedCityNames.map(async (name) => {
        const rawData = await getWeatherAndForecastByCity(name);
        const processed = processWeatherData(rawData, false);
        return processed;
    });

    const resultados = await Promise.all(buscasPromises);
    
    resultados.forEach(clima => {
        if (clima && clima.id !== listaDeClima[0]?.id) { 
            listaDeClima.push(clima);
        }
    });

    setClimas(listaDeClima);
    setLoading(false);
  };
  
  useEffect(() => {
    loadInitialData();
  }, []);

  async function loadInitialData() {
      setLoading(true);
      
      const [savedCityNames, name] = await Promise.all([
          loadUserCitiesFromDB(),
          loadUserNameFromDB() 
      ]);
      
      setUserName(name); 
      
      let localRawData = null;
      try {
          let { status } = await Location.requestForegroundPermissionsAsync();
          if (status === "granted") {
              let local = await Location.getCurrentPositionAsync({});
              localRawData = await getWeatherAndForecastByCoords(local.coords.latitude, local.coords.longitude);
          }
      } catch (e) {
          console.error("Não foi possível obter a localização inicial:", e);
      }
      
      await updateClimasList(localRawData, savedCityNames);
  }

  async function obterLocalizacao() {
    loadInitialData(); 
  }

  async function adicionarCidade() {
    if (cidadeInput.trim() === "") return;
    setLoading(true);

    try {
      const cityName = cidadeInput.trim();
      const rawData = await getWeatherAndForecastByCity(cityName);

      if (rawData.cod !== '200') {
        Alert.alert("Erro", "Cidade não encontrada ou erro na API.");
        return;
      }
      
      let savedCityNames = await loadUserCitiesFromDB();

      const isAlreadyAdded = savedCityNames.some(name => name.toLowerCase() === cityName.toLowerCase());
      
      if (!isAlreadyAdded) {
          savedCityNames = [cityName, ...savedCityNames]; 
          await saveUserCitiesToDB(savedCityNames);
      } else {
          Alert.alert("Aviso", `${cityName} já está na sua lista.`);
      }

      await loadInitialData(); 
      setCidadeInput(""); 

    } catch (error) {
      console.error(error);
      Alert.alert("Erro de Rede", "Não foi possível buscar o clima.");
    } finally {
      setLoading(false);
    }
  }

  const excluirCidade = (cityName) => {
    Alert.alert(
      "Confirmar Exclusão",
      `Tem certeza que deseja remover ${cityName} da sua lista?`,
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        {
          text: "Excluir",
          onPress: async () => {
            setLoading(true);
            try {
              let savedCityNames = await loadUserCitiesFromDB();
              
              const updatedCityNames = savedCityNames.filter(name => name !== cityName);
              
              await saveUserCitiesToDB(updatedCityNames);
              
              await loadInitialData(); 

            } catch (error) {
              Alert.alert("Erro de Exclusão", "Não foi possível remover a cidade.");
              setLoading(false);
            }
          },
          style: "destructive"
        }
      ]
    );
  };

  async function handleLogout() {
    try {
      await signOut(auth);
      setClimas([]);
      navigation.replace("TelaInicial");
    } catch (error) {
      Alert.alert("Erro ao sair", error.message);
    }
  }

  const ForecastItem = ({ data }) => {
    const date = new Date(data.dt * 1000);
    const day = date.toLocaleDateString('pt-BR', { weekday: 'short' });
    const temp = Math.round(data.main.temp);
    const description = data.weather[0].description;

    return (
        <View style={styles.forecastCard}>
            <Text style={styles.forecastDay}>{day}</Text>
            <Text style={styles.forecastTemp}>{temp}°C</Text>
            <Text style={styles.forecastDesc}>{description}</Text>
        </View>
    );
  }

  const renderClimaItem = ({ item }) => {
    return (
      <View key={item.id} style={[styles.item, item.isLocal && styles.itemLocal]}>
        <View style={styles.itemHeader}>
            <Text style={styles.itemName}>{item.name}</Text>
            {item.isLocal ? (
                <Text style={styles.localTag}>Local Atual</Text>
            ) : (
                <TouchableOpacity 
                    style={styles.deleteButton}
                    onPress={() => excluirCidade(item.name)} 
                >
                    <Text style={styles.deleteText}>X</Text>
                </TouchableOpacity>
            )}
        </View>
        
        <Text style={styles.itemTemp}>{Math.round(item.current.temp)}°C</Text>
        <Text style={styles.itemDesc}>{item.current.description}</Text>

        <View style={styles.detailsGrid}>
            <Text style={styles.detailText}>Sensação: {Math.round(item.current.feelsLike)}°C</Text>
            <Text style={styles.detailText}>Vento: {item.current.windSpeed} m/s</Text>
            <Text style={styles.detailText}>Umidade: {item.current.humidity}%</Text>
            <Text style={styles.detailText}>Pressão: {item.current.pressure} hPa</Text>
        </View>

        <Text style={styles.forecastTitle}>Próximos 3 Dias (12h)</Text>
        <View style={styles.forecastContainer}>
            {item.forecast.map(data => (
                <ForecastItem key={data.dt} data={data} />
            ))}
        </View>
      </View>
    );
  };

  if (loading && climas.length === 0) {
    return (
      <ImageBackground source={fundo} style={styles.container} resizeMode="cover">
        <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#007bff" />
            <Text style={{ marginTop: 10, color: '#000080' }}>Carregando dados da sua conta...</Text>
        </View>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground source={fundo} style={styles.container} resizeMode="cover">
      <View style={styles.contentWrapper}>
        <Image source={logo} style={styles.logoHeader} resizeMode="contain" />

        <Text style={styles.greetingText}>Olá, {userName}</Text> 

        <View style={styles.buscaContainer}>
          <TextInput
            placeholder="Adicionar cidade..."
            value={cidadeInput}
            onChangeText={setCidadeInput}
            style={styles.input}
          />
          {loading ? (
              <ActivityIndicator size="small" color="#708c9f" style={{padding: 10, marginLeft: 10}} />
          ) : (
              <TouchableOpacity style={styles.customButtonAdd} onPress={adicionarCidade}>
                  <Text style={styles.customButtonText}>Adicionar</Text>
              </TouchableOpacity>
          )}
        </View>

        {climas.length > 0 ? (
          <FlatList
            data={climas}
            keyExtractor={(item) => item.id.toString() + item.name} 
            renderItem={renderClimaItem}
            style={styles.lista}
            contentContainerStyle={styles.listContent}
          />
        ) : (
          <Text style={styles.semClima}>Nenhuma cidade adicionada. Use o campo acima para começar.</Text>
        )}

        <View style={styles.logoutButtonContainer}>
          <TouchableOpacity style={styles.customButtonLogout} onPress={handleLogout}>
              <Text style={styles.customButtonText}>Sair</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 0 },
  contentWrapper: {
      flex: 1, 
      paddingTop: 60, 
      paddingHorizontal: 20, 
      backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  loadingBox: {
      flex: 1, 
      justifyContent: 'center', 
      alignItems: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  logoHeader: {
    width: '100%', 
    height: 100,   
    marginBottom: 20,
  },
  greetingText: { 
    fontSize: 18,
    fontWeight: 'bold',
    color: '#708c9f',
    marginBottom: 15,
    alignSelf: 'flex-start',
  },
  buscaContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  input: { flex: 1, borderWidth: 1, borderColor: '#ccc', padding: 10, marginRight: 10, borderRadius: 5, backgroundColor: 'white' },
  
  customButtonAdd: {
      backgroundColor: '#708c9f',
      padding: 10,
      borderRadius: 5,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 3,
  },
  customButtonLogout: {
    backgroundColor: '#708c9f',
    padding: 10,
    borderRadius: 5,
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
  logoutButtonContainer: { marginTop: 20, marginBottom: 20 },
  
  lista: { flex: 1 },
  listContent: { paddingBottom: 20 }, 
  item: {
    padding: 15,
    marginVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  itemLocal: {
    backgroundColor: 'rgba(230, 247, 255, 0.9)', 
    borderLeftWidth: 5,
    borderLeftColor: '#007bff',
  },
  itemHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 5,
  },
  itemName: { fontSize: 24, fontWeight: "bold" },
  localTag: {
      fontSize: 12,
      color: '#007bff',
      borderWidth: 1,
      borderColor: '#007bff',
      paddingHorizontal: 6,
      borderRadius: 4,
      alignSelf: 'center',
  },
  itemTemp: { fontSize: 48, fontWeight: '300', color: '#333', marginBottom: 5 },
  itemDesc: { fontSize: 16, color: '#666', marginBottom: 15 },
  
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  detailText: {
    width: '48%', 
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },

  forecastTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      marginTop: 10,
      marginBottom: 10,
      borderTopWidth: 1,
      borderTopColor: '#eee',
      paddingTop: 10,
  },
  forecastContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  forecastCard: {
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 6,
    width: '32%',
  },
  forecastDay: {
      fontSize: 14,
      fontWeight: 'bold',
  },
  forecastTemp: {
      fontSize: 20,
      fontWeight: '500',
      color: '#007bff',
  },
  forecastDesc: {
      fontSize: 12,
      textAlign: 'center',
      color: '#666',
  },

  semClima: { textAlign: 'center', marginTop: 50, color: '#000080' },
  deleteButton: {
      backgroundColor: 'red',
      width: 30,
      height: 30,
      borderRadius: 15,
      justifyContent: 'center',
      alignItems: 'center',
  },
  deleteText: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: 16,
  }
});