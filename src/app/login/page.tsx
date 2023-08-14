"use client"
import { useRouter } from "next/navigation"
import { logInWithGoogle } from "../utils/auth"
import { Button } from "antd"

export default function Login() {
    const router = useRouter()

    const handleGoogleLogin = async () => {
        await logInWithGoogle(() => router.back())
    }

    return (
        <main className="flex min-h-screen flex-col items-center justify-between p-24">
            <Button onClick={handleGoogleLogin}> Login with google</Button>
        </main>
    )
}
