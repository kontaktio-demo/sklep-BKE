import type { Metadata } from "next";
import { ThankYou } from "./ThankYou";

export const metadata: Metadata = { title: "Dziękujemy", robots: { index: false, follow: false } };

export default function ThankYouPage() {
  return (
    <div className="bg-nf-bg">
      <ThankYou />
    </div>
  );
}
