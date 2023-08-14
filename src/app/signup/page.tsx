"use client"
import { useRouter } from "next/navigation"
import { signUpWithGoogle } from "../utils/auth"
import { Button } from "antd"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth } from "@/firebase/clientConfig"
import { useEffect } from "react"

export default function Signup() {
    const router = useRouter()

    const [userData] = useAuthState(auth)

    useEffect(() => {
        if (userData) {
            router.push("/courier")
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userData])
    const handleGoogleSignup = async () => {
        await signUpWithGoogle(() => router.push("/"))
    }

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-24  bg-slate-200">
            <Button
                className="mb-2"
                type="primary"
                onClick={handleGoogleSignup}
            >
                Signup with Google
            </Button>
            <Button type="link" onClick={() => router.push("/login")}>
                Already have an account? Login
            </Button>
        </main>
    )
}
