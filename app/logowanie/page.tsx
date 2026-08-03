import type { Metadata } from "next";
import { LoginClient } from "@/components/account/AccountPages";

export const metadata: Metadata = { title: "Logowanie", robots: { index: false, follow: false } };

export default function LoginPage() {
  return (
    <div className="bg-nf-bg">
      <LoginClient />
    </div>
  );
}
