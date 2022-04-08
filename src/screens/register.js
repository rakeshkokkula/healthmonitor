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
  updateProfile,
  createUserWithEmailAndPassword,
  db,
  addDoc,
  collection,
} from '../firebase/config';
import {AuthContext} from '../routes';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {logoutPrev} from '../auth/api';

const Register = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('patient');

  const authProvider = getAuth();
  const [, setAuth] = useContext(AuthContext);

  const isDoc = str => {
    return str === 'doctor';
  };

  const onRegister = async () => {
    try {
      // const emailRole = role + email;
      const res = await logoutPrev();
      console.log(res, 'resssssssss');
      if (res) {
        createUserWithEmailAndPassword(authProvider, email, password)
          .then(function (result) {
            return updateProfile(authProvider.currentUser, {
              displayName: name,
              photoURL: role,
            });
          })
          .then(async () => {
            // Signed in
            await addDoc(collection(db, 'users'), {
              // id: uuid.v4(),
              name,
              email,
              role,
              loggedIn: true,
            });

            const user = authProvider.currentUser || null;
            console.log(user, 'userrrrrrrrrrr');
            setAuth(user);
            AsyncStorage.setItem('auth', JSON.stringify(user));
            Alert.alert('Successfully Registered!');
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
      } else {
        Alert.alert('Server issue try again');
      }
    } catch (error) {
      Alert.alert('Server issue try again');
      // Alert.alert('err: ' + error);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Enter Name"
        value={name}
        onChangeText={val => setName(val)}
        placeholderTextColor={'#000'}
      />
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
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginLeft: 10,
        }}>
        <Text style={{color: '#000'}}>Select Role</Text>
        <View style={{flexDirection: 'row'}}>
          <TouchableOpacity
            onPress={() => setRole('patient')}
            style={[styles.chip, isDoc(role) ? null : styles.chipActive]}>
            <Text style={isDoc(role) ? styles.chipText : styles.chipTextActive}>
              Patient
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setRole('doctor')}
            style={[styles.chip, isDoc(role) ? styles.chipActive : null]}>
            <Text style={isDoc(role) ? styles.chipTextActive : styles.chipText}>
              Doctor
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.note}>
        {' '}
        Already have account ?{' '}
        <Text style={styles.link} onPress={() => navigation.navigate('Login')}>
          {' '}
          Login{' '}
        </Text>
      </Text>
      <TouchableOpacity style={styles.login} onPress={onRegister}>
        <Text style={styles.chipTextActive}>Register</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Register;

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
  chip: {
    padding: 10,
    backgroundColor: '#ccc',
    borderRadius: 20,
    paddingHorizontal: 20,
    margin: 5,
  },
  chipActive: {
    backgroundColor: 'coral',
  },
  chipText: {
    color: '#000',
  },
  chipTextActive: {
    color: '#fff',
  },
});
