import { AuthCard } from "@/components/v2/auth/AuthCard"
import { ForgotForm } from "@/components/v2/auth/ForgotForm"

export default function ForgotPage() {
  return (
    <AuthCard title="Reset password" subtitle="Send a recovery link to your workspace email.">
      <ForgotForm />
    </AuthCard>
  )
}
