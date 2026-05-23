import { AuthCard } from "@/components/auth/AuthCard"
import { ForgotForm } from "@/components/auth/ForgotForm"

export default function ForgotPage() {
  return (
    <AuthCard title="Reset password" subtitle="Send a recovery link to your workspace email.">
      <ForgotForm />
    </AuthCard>
  )
}
