import { applyHotelPhoto } from "@/lib/hotelPhotoCandidates.server";
import { HotelMediaEditor } from "@/components/admin/HotelMediaEditor";
import { hotelGuides } from "@/lib/hotelGuides";
export const metadata = { title: "Hotel Media | SingHUB Admin" };
export default function HotelAdminPage() { return <HotelMediaEditor hotels={hotelGuides.map(hotel => applyHotelPhoto(hotel))} />; }
