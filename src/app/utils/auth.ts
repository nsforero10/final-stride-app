import { auth, provider } from "@/firebase/clientConfig"
import { signOut } from "firebase/auth"
import { signInWithPopup } from "firebase/auth"
import { createUser, logInServer, signOutServer } from "@/app/_server/userApi"
import { User } from "@/models/types"

export async function logInWithGoogle(callback: () => void) {
    const userCredential = await signInWithPopup(auth, provider)
    const response = await logInServer(userCredential)
    if (response.ok) {
        callback()
    }
}

export async function signUpWithGoogle(callback: () => void) {
    const userCredential = await signInWithPopup(auth, provider)
    const newUser = {
        id: userCredential.user.uid,
        name: userCredential.user.displayName,
        email: userCredential.user.email,
        photoURL: userCredential.user.photoURL,
    } as User

    await createUser(newUser)

    const response = await logInServer(userCredential)
    if (response.ok) {
        callback()
    }
}

export async function logOut(callback: () => void) {
    await signOut(auth)
    const response = await signOutServer()
    if (response.ok) {
        callback()
    }
}
