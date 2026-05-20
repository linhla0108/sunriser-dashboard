import { AuthCard } from "@/components/auth/AuthCard"
import { SignupForm } from "@/components/auth/SignupForm"

export default function SignupPage() {
  return (
    <AuthCard title="Account access" subtitle="New accounts are created by workspace admins only.">
      <SignupForm />
    </AuthCard>
  )
}
