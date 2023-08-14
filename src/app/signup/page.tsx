"use client"
import { useRouter } from "next/navigation"
import { signUpWithGoogle } from "../utils/auth"

export default function Signup() {
    const router = useRouter()
    const handleGoogleSignup = async () => {
        signUpWithGoogle(() => router.back())
    }

    return (
        <main className="flex min-h-screen flex-col items-center justify-between p-24">
            <button onClick={handleGoogleSignup}> Signup with google</button>
        </main>
    )
}
