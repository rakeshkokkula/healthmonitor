import * as firebase from 'firebase/app';
import {
  initializeFirestore,
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  addDoc,
  updateDoc,
  orderBy,
  limit,
} from 'firebase/firestore';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  signOut,
} from 'firebase/auth';

export const firebaseConfig = {
  apiKey: '',
  authDomain: '',
  databaseURL: '',
  projectId: '',
  storageBucket: '',
  messagingSenderId: '',
  appId: '',
};

const firebaseApp = firebase.initializeApp(firebaseConfig);
const db = initializeFirestore(firebaseApp, {
  experimentalForceLongPolling: true,
});
export const chatsRef = query(collection(db, 'chats'));
export const usersRef = query(collection(db, 'users'));
export const doctorsRef = query(
  collection(db, 'users'),
  where('role', '==', 'doctor'),
);
export const patientsRef = query(
  collection(db, 'users'),
  where('role', '==', 'patient'),
);

export {
  firebase,
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  signOut,
  doc,
  setDoc,
  getDoc,
  db,
  addDoc,
  onSnapshot,
  updateDoc,
  orderBy,
  limit,
};
