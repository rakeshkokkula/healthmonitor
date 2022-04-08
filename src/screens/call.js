import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  PermissionsAndroid,
} from 'react-native';
import React from 'react';
import SendIntentAndroid from 'react-native-send-intent';
import RNImmediatePhoneCall from 'react-native-immediate-phone-call';

const CallScreen = () => {
  const InitiateCall = async call => {
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
      call('+91 9966012923', true);
      console.log('You dialed directly');
    } else {
      console.log('No permission');
    }
  };
  return (
    <View>
      <TouchableOpacity
        onPress={() => InitiateCall(SendIntentAndroid.sendPhoneCall)}>
        <Text>Call From SendIntent</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => InitiateCall(RNImmediatePhoneCall.immediatePhoneCall)}>
        <Text>Call From Rn Immediate</Text>
      </TouchableOpacity>
    </View>
  );
};

export default CallScreen;

const styles = StyleSheet.create({});
