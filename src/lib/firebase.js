import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const app = initializeApp({
  apiKey: 'AIzaSyDrQ2NEatHl7zzMxxyiRHBOGec9WMiksX4',
  authDomain: 'cospet-uzbekistan.firebaseapp.com',
  projectId: 'cospet-uzbekistan',
  storageBucket: 'cospet-uzbekistan.firebasestorage.app',
  messagingSenderId: '20520913541',
  appId: '1:20520913541:web:9e05544d3f5917abdff7ec',
});

export const db = getFirestore(app, 'default');
export const auth = getAuth(app);
export const storage = getStorage(app);