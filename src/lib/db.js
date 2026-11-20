import {
  collection, doc, addDoc, setDoc, deleteDoc, updateDoc, onSnapshot, getDoc,
  query, orderBy, serverTimestamp,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';

export const subscribeProducts = (cb) =>
  onSnapshot(collection(db, 'products'), (s) => cb(s.docs.map((d) => ({ id: d.id, ...d.data() }))));

export const saveProduct = (p) => {
  const { id, ...data } = p;
  return id ? setDoc(doc(db, 'products', id), data, { merge: true }) : addDoc(collection(db, 'products'), { ...data, createdAt: serverTimestamp() });
};
export const deleteProduct = (id) => deleteDoc(doc(db, 'products', id));

export function uploadImage(file, max = 900) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * k);
      c.height = Math.round(img.height * k);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(img.src);
      resolve(c.toDataURL('image/jpeg', 0.8));
    };
    img.onerror = () => reject(new Error('Не удалось прочитать фото'));
    img.src = URL.createObjectURL(file);
  });
}

// Заказ. Поле `source` и `telegram` — задел под бота (заказы из Telegram будут писаться в ту же коллекцию).
export const createOrder = (o) =>
  addDoc(collection(db, 'orders'), { ...o, status: 'new', source: 'web', telegram: { notified: false }, createdAt: serverTimestamp() });

export const subscribeOrders = (cb) =>
  onSnapshot(query(collection(db, 'orders'), orderBy('createdAt', 'desc')), (s) => cb(s.docs.map((d) => ({ id: d.id, ...d.data() }))));
export const setOrderStatus = (id, status) => updateDoc(doc(db, 'orders', id), { status });
export const isAdmin = async (uid) => (await getDoc(doc(db, 'admins', uid))).exists();

export const DEMO = [
  { name: 'Kospet Tank M3', category: 'Tank', price: 1890000, oldPrice: 2190000, stock: 12, image: '', description: 'Защищённые смарт-часы 5ATM, AMOLED, GPS, до 25 дней работы.', specs: 'Экран: 1.96" AMOLED\nЗащита: 5ATM, IP69K\nGPS: да\nБатарея: 480 мАч', published: true },
  { name: 'Kospet Tank T3 Ultra', category: 'Tank', price: 2390000, oldPrice: 0, stock: 7, image: '', description: 'Титановый корпус, сапфировое стекло, нагрузка по MIL-STD-810H.', specs: 'Экран: 1.43" AMOLED\nЗащита: 5ATM\nGPS: да\nБатарея: 410 мАч', published: true },
  { name: 'Kospet Rock 2', category: 'Rugged', price: 990000, oldPrice: 1190000, stock: 20, image: '', description: 'Ударопрочные часы для спорта и работы на улице.', specs: 'Экран: 1.32" TFT\nЗащита: 5ATM\nGPS: нет\nБатарея: 300 мАч', published: true },
  { name: 'Kospet Magic 4', category: 'Sport', price: 790000, oldPrice: 0, stock: 15, image: '', description: 'Лёгкие спортивные часы с пульсометром и SpO₂.', specs: 'Экран: 1.78" AMOLED\nЗащита: 3ATM\nGPS: нет\nБатарея: 350 мАч', published: true },
];
export const seedDemo = () => Promise.all(DEMO.map((p) => saveProduct(p)));
