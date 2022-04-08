/* eslint-disable prettier/prettier */
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import React, {useState, useContext} from 'react';
import {
  getAuth,
  signInWithEmailAndPassword,
  doc,
  updateDoc,
  db,
  getDocs,
  query,
  collection,
  where,
} from '../firebase/config';
import {AuthContext} from '../routes';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {logoutPrev} from '../auth/api';

const Login = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const authProvider = getAuth();
  const [, setAuth] = useContext(AuthContext);

  const onLogin = async () => {
    try {
      signInWithEmailAndPassword(authProvider, email, password)
        .then(async userCredential => {
          // Signed in
          const user = userCredential.user;
          user.photoURL === 'patient' && (await logoutPrev());
          // console.log(user.email, 'userrr');
          const data = await getDocs(
            query(collection(db, 'users'), where('email', '==', user.email)),
          );
          let id = '';
          data.forEach(doc => {
            // doc.data() is never undefned for query doc snapshots
            let data = {...doc.data(), _id: doc.id};
            console.log('userrrrr', data);
            AsyncStorage.setItem('user', JSON.stringify(data));
            id = doc.id;
          });
          // console.log('data', id);
          const docRef = doc(db, 'users', id);
          await updateDoc(docRef, {
            loggedIn: true,
          });
          console.log(user, 'userrrrrr');
          setAuth(user);
          AsyncStorage.setItem('auth', JSON.stringify(user));
          Alert.alert('Successfully Logged In!');
          // ...
        })
        .catch(error => {
          if (error.code === 'auth/email-already-in-use') {
            console.log('That email address is already in use!');
            Alert.alert('That email address is already in use!');
          }

          if (error.code === 'auth/invalid-email') {
            console.log('That email address is invalid!');
            Alert.alert('That email address is invalid!');
          }
          Alert.alert(error.code);
          console.error(error);
        });
    } catch {
      Alert.alert('Server issue try again');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Enter email"
        value={email}
        onChangeText={val => setEmail(val)}
        placeholderTextColor={'#000'}
      />
      <TextInput
        style={styles.input}
        placeholder="Enter password"
        value={password}
        secureText={true}
        onChangeText={val => setPassword(val)}
        placeholderTextColor={'#000'}
      />
      <Text style={styles.note}>
        New?{' '}
        <Text
          style={styles.link}
          onPress={() => navigation.navigate('Register')}>
          Register
        </Text>
      </Text>
      <TouchableOpacity style={styles.login} onPress={onLogin}>
        <Text style={styles.chipTextActive}>Login</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  input: {
    padding: 10,
    borderWidth: 1,
    borderRadius: 10,
    margin: 10,
    color: '#000',
  },
  login: {
    padding: 10,
    paddingHorizontal: 30,
    backgroundColor: 'coral',
    alignSelf: 'center',
    borderRadius: 10,
  },
  note: {
    alignSelf: 'center',
    padding: 10,
    color: '#000',
  },
  link: {
    color: 'coral',
  },
  chipTextActive: {
    color: '#fff',
  },
});
