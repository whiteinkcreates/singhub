import Link from "next/link";
import { applyHotelPhoto } from "@/lib/hotelPhotoCandidates.server";
import { HotelMediaEditor } from "@/components/admin/HotelMediaEditor";
import { hotelGuides } from "@/lib/hotelGuides";
export const metadata = { title: "Hotel Media | SingHUB Admin" };
export default function HotelAdminPage() { return <><div style={{padding:"24px 24px 0",color:"#6aeaff"}}><Link href="/admin/hotels/package-intake">Start hotel package from URL →</Link></div><HotelMediaEditor hotels={hotelGuides.map(hotel => applyHotelPhoto(hotel))} /></>; }
