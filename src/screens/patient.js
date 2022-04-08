/* eslint-disable prettier/prettier */
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  PermissionsAndroid,
  RefreshControl,
} from 'react-native';
import React, {useEffect, useState, useContext} from 'react';
import heart from '../assets/heart.png';
import temp from '../assets/temp.png';
import spo2 from '../assets/spo2.jpg';
import chat from '../assets/chat.png';
// import BleDeviceList from './BluetoothList';
import {
  getDocs,
  doctorsRef,
  query,
  collection,
  db,
  where,
  orderBy,
  limit,
  onSnapshot,
  doc,
  setDoc,
  updateDoc,
} from '../firebase/config';
import SendIntentAndroid from 'react-native-send-intent';

import {AuthContext} from '../routes';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Patient = ({navigation}) => {
  const [readData, setReadData] = useState({});
  const [doctors, setDoctors] = useState([]);
  const [user, setUser] = useState({});
  const [refreshing, setRefreshing] = React.useState(false);

  const [auth, setAuth] = useContext(AuthContext);

  useEffect(() => {
    const isMounted = true;
    const runOnce = async () => {
      isMounted && setDoctors([]);
      const querySnapshot = await getDocs(doctorsRef);
      // console.log(querySnapshot);
      querySnapshot.forEach(doc => {
        // doc.data() is never undefned for query doc snapshots
        let data = {...doc.data(), _id: doc.id};
        isMounted && setDoctors(prev => [...prev, data]);
        // console.log(doc.id, ' => ', doc.data());
      });
    };
    runOnce();
  }, []);

  const runAlways = async () => {
    const isMounted = true;
    if (isMounted) {
      setReadData({});
    }

    let data = await AsyncStorage.getItem('user');
    if (data) {
      data = JSON.parse(data);
    } else {
      console.log(auth.email, 'email');
      const q = await getDocs(
        query(collection(db, 'users'), where('email', '==', auth.email)),
      );
      q.forEach(doc => {
        // doc.data() is never undefned for query doc snapshots
        data = {...doc.data(), _id: doc.id};
        AsyncStorage.setItem('user', JSON.stringify(data));
      });
    }
    setUser(data);
    console.log(data._id, 'id');
    // const querySnapshot = await getDocs(
    //   query(
    //     collection(db, 'healthstats'),
    //     where('patientId', '==', data._id),
    //     orderBy('createdAt', 'desc'),
    //     limit(1),
    //   ),
    // );
    onSnapshot(
      query(
        collection(db, 'healthstats'),
        where('patientId', '==', data._id),
        orderBy('createdAt', 'desc'),
        limit(1),
      ),
      async documents => {
        documents.forEach(async document => {
          console.log(document, 'docs');
          // doc.data() is never undefned for query doc snapshots
          let data = {...document.data(), _id: document.id};
          // if (isMounted) {
          isMounted && setReadData({...data});
          if (!data.call) {
            const docRef = doc(db, 'healthstats', document.id);
            await updateDoc(docRef, {
              call: true,
            });
            console.log(data, 'data');
            if (+data.temperature > 36 || +data.heartbeat > 90) {
              InitiateCall();
              console.log('data');
            }
          }
          // console.log(data);
          // }
          // console.log(doc.id, ' => ', doc.data());
        });
      },
    );
  };

  const wait = timeout => {
    return new Promise(resolve => setTimeout(resolve, timeout));
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    wait(2000).then(() => {
      runAlways();
      setRefreshing(false);
    });
  }, []);

  useEffect(() => {
    runAlways();
  }, []);

  // let Id = `${user.ID.slice(0, 8)}-${id.slice(0, 8)}`;
  const onChatAdd = async id => {
    let Id = `${user._id.slice(0, 8)}-${id.slice(0, 8)}`;
    // console.log(Id, 'iddd');
    onSnapshot(doc(db, 'chats', Id), async document => {
      console.log(document.data(), document.id);
      if (document.data()) {
        navigation.navigate('Chat', {id, roomId: Id});
      } else {
        await setDoc(doc(db, 'chats', Id), {
          user: user._id,
          to: id,
          createdAt: new Date(),
        });
        navigation.navigate('Chat', {id, roomId: Id});
      }
    });
  };

  const InitiateCall = async () => {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CALL_PHONE,
      {
        title: 'App Needs Permission',
        message: `Myapp needs phone call permission to dial direclty `,

        buttonNegative: 'Disagree',
        buttonPositive: 'Agree',
      },
    );

    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      SendIntentAndroid.sendPhoneCall('+91 xxxxxxxxxx', true);
      console.log('You dialed directly');
    } else {
      console.log('No permission');
    }
  };

  const onLogout = () => {
    AsyncStorage.removeItem('auth');
    AsyncStorage.removeItem('user');
    setAuth(null);
  };

  return (
    <View>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        <View>
          <TouchableOpacity
            style={{padding: 10, backgroundColor: 'coral'}}
            onPress={onLogout}>
            <Text style={{color: '#fff', alignSelf: 'center'}}>Logout</Text>
          </TouchableOpacity>
          <View style={styles.row}>
            <Image source={heart} style={styles.icon} />
            <Text style={{color: '#000'}}>Heart Beat</Text>
            <Text style={{color: '#000'}}>{readData?.heartbeat || 0} BPM</Text>
          </View>
          <View style={styles.row}>
            <Image source={temp} style={{height: 100, width: 20}} />
            <Text style={{color: '#000'}}>Temperature</Text>
            <Text style={{color: '#000'}}>{readData?.temperature || 0} °C</Text>
          </View>
          <View style={styles.row}>
            <Image source={spo2} style={styles.icon} />
            <Text style={{color: '#000'}}>SPO2</Text>
            <Text style={{color: '#000'}}>{readData?.spo2 || 0} %</Text>
          </View>
          <Text style={{fontSize: 16, margin: 20, color: '#000'}}>
            Chat with Doctor
          </Text>
          {doctors.map((i, index) => {
            return (
              <View
                key={index}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <Text style={{fontSize: 16, margin: 20, color: '#000'}}>
                  {i.name}
                </Text>
                <TouchableOpacity
                  // onPress={() => navigation.navigate('Chat', {docId: i._id})}
                  onPress={() => onChatAdd(i._id)}>
                  <Image source={chat} style={{width: 50, height: 50}} />
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

export default Patient;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    margin: 20,
    alignItems: 'center',
  },
  icon: {
    width: 80,
    height: 80,
  },
});
