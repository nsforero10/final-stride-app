import { initializeApp, getApps, cert } from "firebase-admin/app"

const firebaseAdminConfig = {
    credential: cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        privateKey: process.env.NEXT_PUBLIC_FIREBASE_PRIVATE_KEY,
        clientEmail: process.env.NEXT_PUBLIC_FIREBASE_CLIENT_EMAIL_APP,
    }),
}

export function customInitApp() {
    if (!getApps().length) {
        initializeApp(firebaseAdminConfig)
    }
}
