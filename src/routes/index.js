import React, {createContext, useState, useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Login from '../screens/login';
import Register from '../screens/register';
import Patient from '../screens/patient';
import Doctor from '../screens/doctor';
import Chat from '../screens/chat';
import PatientView from '../screens/patientView';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import {usersRef, getDocs} from '../firebase/config';

const Stack = createNativeStackNavigator();

export const AuthContext = createContext();

const Routes = () => {
  const [auth, setAuth] = useState(null);

  const isDoc = auth?.photoURL?.toLowerCase() === 'doctor';

  useEffect(() => {
    const isMouted = true;
    const getAuth = async () => {
      let data = await AsyncStorage.getItem('auth');
      if (data) {
        data = JSON.parse(data);
      }
      isMouted && setAuth(data);
    };
    getAuth();
    // AsyncStorage.removeItem('auth');
    // setAuth(null);
  }, []);
  return (
    <AuthContext.Provider value={[auth, setAuth]}>
      <NavigationContainer>
        {!auth ? (
          <Stack.Navigator initialRouteName="Login">
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="Register" component={Register} />
          </Stack.Navigator>
        ) : isDoc ? (
          <Stack.Navigator initialRouteName="Doctor">
            <Stack.Screen name="Doctor" component={Doctor} />
            <Stack.Screen name="Patient View" component={PatientView} />
            <Stack.Screen name="Chat" component={Chat} />
          </Stack.Navigator>
        ) : (
          <Stack.Navigator initialRouteName="Patient">
            <Stack.Screen name="Patient" component={Patient} />
            <Stack.Screen name="Chat" component={Chat} />
          </Stack.Navigator>
        )}
      </NavigationContainer>
    </AuthContext.Provider>
  );
};

export default Routes;
