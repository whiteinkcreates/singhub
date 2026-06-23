import { redirect } from "next/navigation";

export const metadata = {
  title: "Find Karaoke in San Diego | SingHUB",
  robots: {
    index: false,
    follow: true,
  },
};

export default function KaraokeNearMePage() {
  redirect("/find-karaoke");
}
