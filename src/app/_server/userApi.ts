import { UserCredential } from "@firebase/auth"
import { User } from "@/models/types"

export async function createUser(newUser: User) {
    const response = await fetch("/api/users", {
        method: "POST",
        body: JSON.stringify(newUser),
    })
    return response
}

export async function logInServer(userCred: UserCredential) {
    const response = await fetch("/api/login", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${await userCred.user.getIdToken()}`,
        },
    })
    return response
}

export async function getUserById(userId: string) {
    const response = await fetch(`/api/users/${userId}`, {
        method: "GET",
    })
    return response
}

export async function signOutServer() {
    const response = await fetch("/api/signout", {
        method: "POST",
    })
    return response
}
