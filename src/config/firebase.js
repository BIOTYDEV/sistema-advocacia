const admin = require('firebase-admin');
require('dotenv').config();

let db;

try {
    if (process.env.FIREBASE_CREDENTIALS) {
        const serviceAccount = JSON.parse(process.env.FIREBASE_CREDENTIALS);
        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
        }
        db = admin.firestore();
        console.log("🔥 Conectado ao Firebase Firestore.");
    } else {
        throw new Error("Variável FIREBASE_CREDENTIALS não encontrada.");
    }
} catch (error) {
    console.warn("⚠️ ALERTA: Firebase não configurado. O sistema usará armazenamento volátil (Memória) até que a variável seja configurada na Vercel.", error.message);
    db = null; 
}

module.exports = db;
