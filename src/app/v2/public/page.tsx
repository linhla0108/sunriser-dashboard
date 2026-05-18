import { redirect } from "next/navigation"

// Keeps Next.js typed-routes happy: /v2/public has a layout, so it also needs
// an index page. Sending visitors to /v2/public/results is the sane default.
export default function V2PublicIndexPage() {
  redirect("/v2/public/results")
}
