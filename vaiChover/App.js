import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import TelaInicial from "./TelaInicial";
import TelaLogin from "./TelaLogin";
import TelaCadastro from "./TelaCadastro"
import TelaHome from "./TelaHome";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="TelaInicial">
        <Stack.Screen name="TelaInicial" component={TelaInicial} options={{ headerShown: false }} />
        <Stack.Screen name="TelaLogin" component={TelaLogin} />
        <Stack.Screen name="TelaCadastro" component={TelaCadastro} />
        <Stack.Screen name="TelaHome" component={TelaHome} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
