import type { Metadata } from "next";
import { SingBoard } from "@/components/singboard/SingBoard";
import { getActiveSingBoardFlyers } from "@/lib/singboard/repository";
import { SINGBOARD_STICKER_ART } from "@/lib/singboardStickerArt";

export const metadata: Metadata = {
  title: "SingBOARD | SingHUB",
  description: "See San Diego karaoke events, community notices, and wanted posts from local venues and KJs on SingBOARD.",
  alternates: { canonical: "/singboard" },
};

export const dynamic = "force-dynamic";

export default async function SingBoardPage() {
  const flyers = await getActiveSingBoardFlyers();
  const stickerBackground = { backgroundImage: `url("${SINGBOARD_STICKER_ART}")` };

  return (
    <main className="min-h-screen overflow-hidden bg-[#05060a]">
      <style>{`
        .singboard-sticker-hero {
          background-position: center 8%;
          background-repeat: no-repeat;
          background-size: cover;
        }
        @media (max-width: 640px) {
          .singboard-sticker-hero {
            background-position: center top;
            background-size: cover;
          }
        }
      `}</style>

      <section
        className="singboard-sticker-hero relative isolate min-h-[320px] overflow-hidden border-b border-white/10 sm:min-h-[390px] lg:min-h-[460px]"
        style={stickerBackground}
        aria-labelledby="singboard-page-title"
      >
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,3,7,.94)_0%,rgba(2,3,7,.68)_35%,rgba(2,3,7,.2)_72%,rgba(2,3,7,.34)_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#05060a] via-transparent to-black/25" />
        <div className="relative mx-auto flex min-h-[320px] max-w-7xl items-end px-5 pb-9 pt-12 sm:min-h-[390px] sm:px-7 sm:pb-11 lg:min-h-[460px] lg:px-8 lg:pb-14">
          <div className="max-w-3xl">
            <img
              src="/images/singhub-v2/singhub-wordmark.png"
              alt="SingHUB"
              className="mb-6 h-auto w-40 drop-shadow-[0_0_20px_rgba(0,0,0,.9)] sm:w-52"
            />
            <h1
              id="singboard-page-title"
              className="max-w-3xl text-4xl font-black leading-[.94] tracking-[-.045em] text-white drop-shadow-[0_4px_20px_rgba(0,0,0,.9)] sm:text-6xl lg:text-7xl"
            >
              San Diego karaoke&apos;s community bulletin board.
            </h1>
          </div>
        </div>
      </section>

      <section className="relative bg-[#05060a] py-7 sm:py-10">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 w-5 border-r border-white/10 bg-repeat-y sm:w-10 lg:w-20 xl:w-24"
          style={{ ...stickerBackground, backgroundPosition: "left top", backgroundSize: "1100px auto" }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 w-5 border-l border-white/10 bg-repeat-y sm:w-10 lg:w-20 xl:w-24"
          style={{ ...stickerBackground, backgroundPosition: "right 280px", backgroundSize: "1100px auto" }}
        />

        <div className="relative z-10 mx-auto max-w-7xl bg-[#05060a] px-4 py-3 shadow-[0_0_80px_rgba(0,0,0,.92)] sm:px-6 sm:py-5 lg:px-8">
          <SingBoard initialFlyers={flyers} />
        </div>
      </section>
    </main>
  );
}
