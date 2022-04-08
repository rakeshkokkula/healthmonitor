import {View} from 'react-native';
import React from 'react';
import Routes from './src/routes';
// import CallScreen from './src/screens/call';

const App = () => {
  return (
    <View style={{flex: 1}}>
      <Routes />
      {/* <BluetoothScanner /> */}
      {/* <CallScreen /> */}
    </View>
  );
};

export default App;
