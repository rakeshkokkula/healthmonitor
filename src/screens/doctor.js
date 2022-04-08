/* eslint-disable prettier/prettier */
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import React, {useContext, useState, useEffect} from 'react';
import userImg from '../assets/user.png';
import {
  getDocs,
  patientsRef,
  query,
  collection,
  db,
  where,
} from '../firebase/config';

import {AuthContext} from '../routes';
import AsyncStorage from '@react-native-async-storage/async-storage';

const screenWidth = Dimensions.get('window').width;

const Doctor = ({navigation}) => {
  const [patients, setPatients] = useState([]);
  const [auth, setAuth] = useContext(AuthContext);
  const onLogout = () => {
    AsyncStorage.removeItem('user');
    AsyncStorage.removeItem('auth');
    setAuth(null);
  };
  // console.log(auth, 'authh');
  useEffect(() => {
    const isMounted = true;
    const runOnce = async () => {
      isMounted && setPatients([]);
      let data = await AsyncStorage.getItem('user');
      if (data) {
        data = JSON.parse(data);
      } else {
        const q = await getDocs(
          query(collection(db, 'users'), where('email', '==', auth.email)),
        );
        q.forEach(doc => {
          // doc.data() is never undefned for query doc snapshots
          data = {...doc.data(), _id: doc.id};
          AsyncStorage.setItem('user', JSON.stringify(data));
        });
      }
      console.log(auth.email, 'email', data);
      const querySnapshot = await getDocs(patientsRef);
      // console.log(querySnapshot);
      querySnapshot.forEach(doc => {
        // doc.data() is never undefned for query doc snapshots
        let data = {...doc.data(), _id: doc.id};
        isMounted && setPatients(prev => [...prev, data]);
        // console.log(doc.id, ' => ', doc.data());
      });
    };
    runOnce();
  }, []);

  return (
    <View>
      <ScrollView>
        <TouchableOpacity
          style={{padding: 10, backgroundColor: 'coral'}}
          onPress={onLogout}>
          <Text style={{color: '#fff', alignSelf: 'center'}}>Logout</Text>
        </TouchableOpacity>
        <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
          {patients.map(i => {
            return (
              <PatientCard
                key={i._id}
                name={i.name}
                data={i}
                navigation={navigation}
              />
            );
          })}
          {/* <PatientCard name="Patient" navigation={navigation} />
          <PatientCard name="Patient" navigation={navigation} />
          <PatientCard name="Patient" navigation={navigation} /> */}
        </View>
      </ScrollView>
    </View>
  );
};

export default Doctor;

const styles = StyleSheet.create({
  card: {
    width: screenWidth / 5,
    height: screenWidth / 5,
    borderWidth: 1,
    borderRadius: 20,
    margin: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {width: 50, height: 50},
});

const PatientCard = ({name, navigation, data}) => {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('Patient View', data)}>
      <Image source={userImg} style={styles.icon} />
      <Text style={{color: '#000'}}>{name}</Text>
    </TouchableOpacity>
  );
};
