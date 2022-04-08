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
import React, {useState, useEffect} from 'react';
import {LineChart} from 'react-native-chart-kit';
import chat from '../assets/chat.png';
import {
  getDocs,
  query,
  collection,
  db,
  where,
  orderBy,
  limit,
} from '../firebase/config';
import AsyncStorage from '@react-native-async-storage/async-storage';

const screenWidth = Dimensions.get('window').width;

const PatientView = ({navigation, route}) => {
  const {_id, name} = route.params;
  const [temperature, setTemperature] = useState([]);
  const [heartBeat, setHeartBeat] = useState([]);
  const [spo2, setSpo2] = useState([]);
  const [labels, setLabels] = useState([]);
  const [user, setUser] = useState({});

  useEffect(() => {
    try {
      const isMounted = true;
      const runOnce = async () => {
        if (isMounted) {
          setTemperature([]);
          setHeartBeat([]);
          setSpo2([]);
          setLabels([]);
        }
        let data = await AsyncStorage.getItem('user');
        data = data ? JSON.parse(data) : {};
        setUser(data);
        const querySnapshot = await getDocs(
          query(
            collection(db, 'healthstats'),
            where('patientId', '==', _id),
            orderBy('createdAt', 'desc'),
            limit(10),
          ),
        );
        // console.log(querySnapshot);
        querySnapshot.forEach(doc => {
          // doc.data() is never undefned for query doc snapshots
          let data = {...doc.data(), _id: doc.id};
          console.log(data, 'data');
          if (isMounted) {
            setTemperature(prev => [...prev, data.temperature]);
            setHeartBeat(prev => [...prev, data.heartbeat]);
            setSpo2(prev => [...prev, data.spo2]);
            setLabels(prev => [
              ...prev,
              data.createdAt.toDate().toDateString(),
            ]);
            // console.log(data);
          }
          // console.log(doc.id, ' => ', doc.data());
        });
      };
      runOnce();
    } catch (error) {
      console.log(error);
    }
  }, []);

  // [20, 45, 28, 80, 99, 43];
  // ['January', 'February', 'March', 'April', 'May', 'June'];
  const data = (labels = [], data = []) => {
    return {
      labels: data.length ? labels : [1],
      datasets: [
        {
          data: labels.length ? data : [1],
          color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`, // optional
          strokeWidth: 2, // optional
        },
      ],
      // legend: ['Rainy Days'], // optional
    };
  };
  const chartConfig = {
    backgroundGradientFrom: '#152B7E',
    // backgroundGradientFromOpacity: 0,
    backgroundGradientTo: '#2A4496',
    // backgroundGradientToOpacity: 0.5,
    color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
    // strokeWidth: 2, // optional, default 3
    // barPercentage: 0.5,
    // useShadowColorFromDataset: false, // optional
  };
  return (
    <View>
      <ScrollView>
        <Text style={{fontSize: 16, margin: 10}}>Patient Name: {name}</Text>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginHorizontal: 12,
          }}>
          <Text style={{fontSize: 16, color: '#000'}}>Chat with Patient</Text>
          <TouchableOpacity
            onPress={() => {
              console.log('hello');
              let Id = `${_id.slice(0, 8)}-${user._id.slice(0, 8)}`;
              console.log(Id);
              navigation.navigate('Chat', {
                id: user._id,
                roomId: Id,
                doctor: true,
              });
            }}>
            <Image source={chat} style={{width: 50, height: 50}} />
          </TouchableOpacity>
        </View>
        <Text
          style={{
            marginHorizontal: 10,
            fontSize: 16,
            fontWeight: '700',
            color: '#000',
          }}>
          Temperature Chart :
        </Text>
        <LineChart
          data={data(labels, temperature)}
          width={screenWidth}
          height={206}
          verticalLabelRotation={30}
          chartConfig={chartConfig}
          bezier
          style={{margin: 10, borderRadius: 10}}
        />
        <Text
          style={{
            marginHorizontal: 10,
            fontSize: 16,
            fontWeight: '700',
            color: '#000',
          }}>
          HeartBeat Chart :
        </Text>
        <LineChart
          data={data(labels, heartBeat)}
          width={screenWidth}
          height={206}
          verticalLabelRotation={30}
          chartConfig={chartConfig}
          bezier
          style={{margin: 10, borderRadius: 10}}
        />
        <Text
          style={{
            marginHorizontal: 10,
            fontSize: 16,
            fontWeight: '700',
            color: '#000',
          }}>
          Spo2 Chart :
        </Text>
        <LineChart
          data={data(labels, spo2)}
          width={screenWidth}
          height={206}
          verticalLabelRotation={30}
          chartConfig={chartConfig}
          bezier
          style={{margin: 10, borderRadius: 10}}
        />
      </ScrollView>
    </View>
  );
};

export default PatientView;

const styles = StyleSheet.create({});
