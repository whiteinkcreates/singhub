import { redirect } from "next/navigation";

export const metadata = { title: "Vote | SingHUB", robots: { index: true, follow: true } };

export default function VotePage() {
  redirect("/#daily-mic");
}
