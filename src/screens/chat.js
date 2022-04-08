import {StyleSheet, Text, View} from 'react-native';
import React, {useState, useEffect, useLayoutEffect} from 'react';
import {GiftedChat} from 'react-native-gifted-chat';
// import {doc, onSnapshot} from 'firebase/firestore';
import {
  orderBy,
  collection,
  db,
  query,
  onSnapshot,
  addDoc,
  doc,
} from '../firebase/config';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Chat = ({route}) => {
  const [messages, setMessages] = useState([]);
  const [user, setUser] = useState({});
  const {id, roomId, doctor} = route?.params || {};

  console.log(id, 'iddddddd');

  useLayoutEffect(() => {
    setMessages([]);
    const run = async () => {
      let data = await AsyncStorage.getItem('user');
      data = data ? JSON.parse(data) : {};
      setUser(data);
    };
    run();
    const msgColl = query(
      collection(db, 'chats', roomId, 'messages'),
      orderBy('createdAt', 'desc'),
    );
    const unsub = onSnapshot(msgColl, doc => {
      //  setMessages(querySnapshot.docs.map(msg => msg.data()));
      setMessages(
        doc.docs.map(msg => {
          console.log(msg.data());
          return {...msg.data(), createdAt: msg.data().createdAt.toDate()};
          // return {
          //   _id: msg.id,
          //   text: msg.data().text,
          //   createdAt: msg.data().createdAt.toDate(),
          //   user: {
          //     _id: msg.data().user.Id,
          //     name: msg.data().name,
          //   },
          // };
        }),
      );
    });

    // setMessages([
    //   {
    //     _id: 1,
    //     text: 'Hello developer',
    //     createdAt: new Date(),
    //     user: {
    //       _id: 2,
    //       name: 'React Native',
    //       avatar: 'https://placeimg.com/140/140/any',
    //     },
    //   },
    // ]);
    return () => {
      unsub;
    };
  }, []);
  const onSend = async message => {
    await addDoc(collection(db, 'chats', roomId, 'messages'), message[0]);
    // setMessages(msg => [...msg, message[0]]);
  };
  // const onSend = useCallback((messages = []) => {
  //   setMessages(previousMessages =>
  //     GiftedChat.append(previousMessages, messages),
  //   );
  // }, []);
  // console.log(messages, 'msg');
  return (
    <View style={{flex: 1}}>
      <GiftedChat
        // keyboardShouldPersistTaps="handled"
        messages={messages}
        onSend={messages => onSend(messages)}
        user={{
          _id: user._id,
          name: user.name,
          // _id: user.ID,
          // name: `${user.Firstname} ${user.Lastname}`,
        }}
      />
    </View>
  );
};

export default Chat;

const styles = StyleSheet.create({});
