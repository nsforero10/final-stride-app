"use client"
import { useRouter } from "next/navigation"
import { logInWithGoogle } from "../utils/auth"
import { Button } from "antd"
import { useEffect } from "react"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth } from "@/firebase/clientConfig"

export default function Login() {
    const router = useRouter()
    const [userData] = useAuthState(auth)

    useEffect(() => {
        if (userData) {
            router.push("/courier")
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userData])
    const handleGoogleLogin = async () => {
        await logInWithGoogle(() => router.push("/"))
    }

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-24  bg-slate-200">
            <Button className="mb-2" type="primary" onClick={handleGoogleLogin}>
                Login with Google
            </Button>
            <Button type="link" onClick={() => router.push("/signup")}>
                Create an account
            </Button>
        </main>
    )
}
