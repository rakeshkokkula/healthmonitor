import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  FlatList,
  Button,
  PermissionsAndroid,
  TouchableOpacity,
} from 'react-native';
import base64 from 'react-native-base64';
import {BleManager} from 'react-native-ble-plx';

export const manager = new BleManager();

const requestPermission = async () => {
  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    {
      title: 'Request for Location Permission',
      message: 'Bluetooth Scanner requires access to Fine Location Permission',
      buttonNeutral: 'Ask Me Later',
      buttonNegative: 'Cancel',
      buttonPositive: 'OK',
    },
  );
  return granted === PermissionsAndroid.RESULTS.GRANTED;
};

// BlueetoothScanner does:
// - access/enable bluetooth module
// - scan bluetooth devices in the area
// - list the scanned devices
const BluetoothScanner = () => {
  const [logData, setLogData] = useState([]);
  const [logCount, setLogCount] = useState(0);
  const [scannedDevices, setScannedDevices] = useState({});
  const [deviceCount, setDeviceCount] = useState(0);
  const [isEnabled, setEnabled] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    manager.onStateChange(state => {
      const subscription = manager.onStateChange(async state => {
        console.log(state);
        //  const btState = await manager.state();
        setEnabled(state);
        const newLogData = logData;
        newLogData.push(state);
        await setLogCount(newLogData.length);
        await setLogData(newLogData);
        subscription.remove();
      }, true);
      return () => subscription.remove();
    });
  }, [manager]);

  const discoverAllServices = async d => {
    await DeviceManager.discoverAllServicesAndCharacteristicsForDevice(
      d.id,
      null,
    ).then(response => {
      console.log(response, 'discoverAllServicesAndCharacteristicsForDevice');
    });
  };

  const discoveringCharastics = async d => {
    console.log(d, 'd', d.id, d.serviceUUIDs[0]);
    // let allCharacteristicsData = await DeviceManager.characteristicsForDevice(
    //   d.id,
    //   d.serviceUUIDs[0],
    // );

    const data = await DeviceManager.readCharacteristicForDevice(
      d.id,
      d.serviceUUIDs[0],
      null,
      null,
    );
    console.log(data, 'data').then(response => {
      console.log(response, 'response');
    });

    discoverAllServices();
  };
  const handleClick = async device => {
    // console.log(device,"device")
    DeviceManager.stopDeviceScan();
    await DeviceManager.connectToDevice(device.id, null)
      .then(async device => {
        let allCharacteristics = device.discoverAllServicesAndCharacteristics();
        let checkDeviceIConnected = await DeviceManager.isDeviceConnected(
          device.id,
        );
        console.log(
          checkDeviceIConnected,
          'status if device connected it returns true',
        );
        if (checkDeviceIConnected === true) {
          //   this.props.dispatch(changeStatus('Connected'));
          setIsConnected(true);
        } else {
          //   this.props.dispatch(changeStatus('Disconnected'));
          setIsConnected(false);
        }
        return allCharacteristics;
      })
      .then(device => {
        let services = device.services(device.id);
        return services;
      })
      .then(
        services => {
          console.log('*******services*************');
          console.log('found services: ', services);
          discoveringCharastics(device);
        },
        error => {
          console.log(this._logError('SCAN', error));
        },
      );
  };
  connectableString = item => {
    if (item.isConnectable) {
      if (item.name.toString().includes('PR BT')) {
      }
      return 'Tap to connect to: ' + item.name;
    } else {
      return item.name + item.name.toString().includes('PR BT')
        ? base64.decode(base64.encode(item.name))
        : ' ' + ' is not connectable';
    }
  };

  //   () => {
  //                   manager
  //                     .connectToDevice(item.id, null)
  //                     .then(device => {
  //                       await device.discoverAllServicesAndCharacteristics();
  //                       const services = await device.services();
  //                       console.log(services);
  //                     })
  //                     .catch(err => {
  //                       alert('Error in connecting bluetooth');
  //                     });
  //                 }

  return (
    <View style={{flex: 1, padding: 10}}>
      <Button
        title={`Turn ${isEnabled !== 'PoweredOn' ? 'On' : 'Off'} Bluetooth`}
        onPress={async () => {
          const btState = await manager.state();
          // test is bluetooth is supported
          if (btState === 'Unsupported') {
            alert('Bluetooth is not supported');
            return false;
          }
          // enable if it is not powered on
          if (btState !== 'PoweredOn') {
            await manager.enable();
          } else {
            await manager.disable();
          }
          return true;
        }}
      />
      <Text>{`Bluetooth is ${
        isConnected ? 'connected' : 'not connected'
      }`}</Text>
      {/* </View> */}

      <View style={{flex: 2, padding: 10}}>
        <Text style={{fontWeight: 'bold'}}>
          Scanned Devices ({deviceCount})
        </Text>
        <FlatList
          data={Object.values(scannedDevices)}
          renderItem={({item}) => {
            return (
              <TouchableOpacity
                onPress={handleClick}
                style={{
                  padding: 10,
                  marginVertical: 5,
                  backgroundColor: 'coral',
                }}>
                <Text
                  style={{color: '#000'}}>{`${item.name} (${item.id})`}</Text>
              </TouchableOpacity>
            );
          }}
        />
        <Button
          title="Scan Devices"
          onPress={async () => {
            const btState = await manager.state();
            // test if bluetooth is powered on
            if (btState !== 'PoweredOn') {
              alert('Bluetooth is not powered on');
              return false;
            }
            // explicitly ask for user's permission
            const permission = await requestPermission();
            if (permission) {
              manager.startDeviceScan(null, null, async (error, device) => {
                // error handling
                if (error) {
                  console.log(error);
                  return;
                }
                // found a bluetooth device
                if (device) {
                  //   console.log(device);
                  //   console.log(`${device.name} (${device.id})}`);
                  const newScannedDevices = scannedDevices;
                  newScannedDevices[device.id] = device;
                  await setDeviceCount(Object.keys(newScannedDevices).length);
                  await setScannedDevices(scannedDevices);
                }
              });
            }
            return true;
          }}
        />
      </View>
    </View>
  );
};

export default BluetoothScanner;
