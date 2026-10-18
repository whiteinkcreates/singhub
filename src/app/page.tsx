import type {Metadata} from 'next';
import Link from 'next/link';
import {redirect} from 'next/navigation';
import {HomepageHeroImage} from '@/components/home/HomepageHeroImage';
import {HeroScrollCue} from '@/components/layout/HeroScrollCue';
import {getDiscoveryData} from '@/lib/v2/data';
import {getHostMediaSettings} from '@/lib/hostMedia.server';
import {SITE_SINGBOARD_HERO_KEY} from '@/lib/hostMedia';
import {SINGBOARD_STICKER_ART} from '@/lib/singboardStickerArt';
import {getSanDiegoNightlifeWeekday} from '@/lib/nightlifeTime';
import {plusNight} from '@/lib/karaokePlusOverlap';
import './landing.css';

export const dynamic='force-dynamic';
export const metadata:Metadata={title:'SingHUB | Find Your Mic in San Diego',description:'Find karaoke tonight, discover local events, and make every night part of your SingHUB story.',alternates:{canonical:'/'}};

type Highlight={name:string;title:string;image:string;count:number;description:string};
export default async function Home({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}){
 const params=await searchParams;
 // Keep previously issued hotel-source links in the guest-to-discovery handoff.
 const source=typeof params.source==='string'?params.source:'';
 if(source.startsWith('hotel-'))redirect('/discover?source='+encodeURIComponent(source));
 const [{rows},boardHero]=await Promise.all([
  getDiscoveryData(),
  getHostMediaSettings(SITE_SINGBOARD_HERO_KEY).catch(()=>null)
 ]);
 const day=getSanDiegoNightlifeWeekday();
 const eligible=rows.filter(row=>row.venue.venueType!=='private_room'&&row.venue.slug!=='winstons-beach-club')
  .map(row=>({row,night:plusNight(row.venue.slug,row.events,day,true)}))
  .filter(result=>result.night.eligible);
 const choices:Highlight[]=[
  {name:'Game day',title:'The game and the mic.',image:'/images/backyard/football.webp',
   count:eligible.filter(item=>item.night.scheduled.some(extra=>extra.category==='sports'&&extra.status==='venue_published')).length,
   description:'Verified sports programming alongside karaoke on the same night.'},
  {name:'Live music',title:'One night. More music.',image:'/images/backyard/live-music.webp',
   count:eligible.filter(item=>item.night.scheduled.some(extra=>extra.category==='live_music'&&extra.status==='venue_published')).length,
   description:'Karaoke and live music on the same nightly lineup.'},
  {name:'Trivia night',title:'Brains and a mic.',image:'/images/backyard/trivia.webp',
   count:eligible.filter(item=>item.night.scheduled.some(extra=>extra.category==='trivia'&&extra.status==='venue_published')).length,
   description:'Trivia and karaoke scheduled for the same night.'},
  {name:'Pool & games',title:'Play a round. Sing a song.',image:'/images/backyard/pool-games.webp',
   count:eligible.filter(item=>item.night.amenities.some(value=>/pool|darts|arcade|bowling|cornhole|foosball|shuffleboard/i.test(value))).length,
   description:'Karaoke venues with pool, arcade games or other extras.'}
 ];
 // Rotate only among qualified content. No unverified football screening claims.
 const available=choices.filter(choice=>choice.count>0);
 const index=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'].indexOf(day);
 const spotlight=available.length?available[Math.max(index,0)%available.length]:null;
 const featureImage=spotlight?.image||'/images/backyard/live-music.webp';

 return <main data-scroll-page="landing" className="singhub-landing">
  <section data-page-hero className="landing-hero" aria-labelledby="landing-title">
   <HomepageHeroImage/>
   <div className="landing-hero-layout">
    <div data-hero-copy className="landing-hero-copy">
     <p className="landing-eyebrow">SAN DIEGO KARAOKE AND MORE</p>
     <h1 id="landing-title">Find your mic <span>tonight.</span></h1>
     <p className="landing-deck">Find a place to sing, see what else is going on, and maybe discover your new favorite spot.</p>
     <form action="/discover" method="get" className="landing-search">
      <label htmlFor="landing-search-input" className="sr-only">Search karaoke venues, hosts or neighborhoods</label>
      <span aria-hidden="true" className="landing-search-icon">⌕</span>
      <input id="landing-search-input" name="q" type="search" placeholder="Venue, neighborhood or host"/>
      <button type="submit">Find karaoke <span aria-hidden="true">↗</span></button>
     </form>
     <div className="landing-shortcuts">
      <Link href="/discover">Tonight &amp; This Week <span aria-hidden="true">↗</span></Link>
      <Link href="/discover?plus=1">Karaoke<span aria-hidden="true">➕</span><span className="sr-only"> plus</span> <span aria-hidden="true">✦</span></Link>
     </div>
    </div>
   </div>
   <HeroScrollCue/>
  </section>

  <section data-page-surface className="landing-surface" aria-labelledby="landing-features-title">
   <div className="landing-inner">
    <header className="landing-section-heading">
     <div><p className="landing-eyebrow">THERE&apos;S MORE TO SINGHUB</p><h2 id="landing-features-title">Karaoke&apos;s just the beginning.</h2></div>
     <p>The places you go, the people you meet, and all the stuff happening around the mic.</p>
    </header>
    <div className="landing-collage">
     <Link href="/discover?plus=1" className="landing-tile landing-tile-plus">
      <img src={featureImage} alt="" className="landing-tile-photo"/>
      <span className="landing-image-shade"/>
      <div className="landing-tile-copy">
       <span className="landing-tile-tag">KARAOKE<span aria-hidden="true">➕</span><span className="sr-only"> plus</span> · {day.toUpperCase()}</span>
       <h3>{spotlight?.title||'Karaoke and something extra.'}</h3>
       <p>Find karaoke venues with more to offer.</p>
       <p className="landing-plus-detail">{spotlight?spotlight.count+' matching places today · '+spotlight.description:'Explore karaoke spots with games, music and more.'}</p>
       <span className="landing-tile-action">Explore Karaoke<span aria-hidden="true">➕</span><span className="sr-only"> plus</span> <span aria-hidden="true">↗</span></span>
      </div>
     </Link>
     <Link href="/account" className="landing-tile landing-tile-jacket">
      <img src="/images/singhub-v2/jacket-denim-blank.png" alt="" className="landing-jacket-art"/>
      <div className="landing-tile-copy">
       <span className="landing-tile-tag">MY SINGHUB · MY TOUR</span>
       <h3>Your nights<br/>add up.</h3>
       <p>Save your favorite spots, log your songs, and make that jacket your own.</p>
       <span className="landing-tile-action">Explore My SingHUB <span aria-hidden="true">↗</span></span>
      </div>
     </Link>
     <Link href="/singboard" className="landing-tile landing-tile-board">
      <img src={boardHero?.heroUrl||SINGBOARD_STICKER_ART} alt="" className="landing-tile-photo"/>
      <span className="landing-image-shade"/>
      <div className="landing-tile-copy">
       <span className="landing-tile-tag">SINGBOARD</span>
       <h3>What&apos;s going on around here?</h3>
       <p>Flyers, special events, community updates, and a few good reasons to get out of the house.</p>
       <span className="landing-tile-action">Check the Board <span aria-hidden="true">↗</span></span>
      </div>
     </Link>
     <Link href="/hosts" className="landing-tile landing-tile-hosts">
      <img src="/images/hosts/hosts-booth.webp" alt="" className="landing-hosts-art"/>
      <span className="landing-image-shade"/>
      <div className="landing-tile-copy">
       <span className="landing-tile-tag">BEHIND THE MIC</span>
       <h3>Meet the people<br/>running the room.</h3>
       <p>Find the KJs behind San Diego&apos;s karaoke nights, and see where they&apos;re hosting.</p>
       <span className="landing-tile-action">Meet the Hosts <span aria-hidden="true">↗</span></span>
      </div>
     </Link>
     <Link href="/backyard" className="landing-tile landing-tile-backyard">
      <div className="landing-backyard-photos" aria-hidden="true">
       <img src="/images/backyard/bowling.webp" alt=""/>
       <img src="/images/backyard/trivia.webp" alt=""/>
      </div>
      <span className="landing-image-shade"/>
      <div className="landing-tile-copy">
       <span className="landing-tile-tag">A SIDE QUEST FROM SINGHUB</span>
       <h3>Not everything needs a microphone.</h3>
       <p>Games, trivia, live music, and whatever else is happening at your favorite karaoke spots.</p>
       <span className="landing-tile-action">Wander into The Backyard <span aria-hidden="true">↗</span></span>
      </div>
     </Link>
    </div>
    <div className="landing-outro"><p>Enough talking about karaoke. Go find some.</p><Link href="/discover">Find karaoke tonight <span aria-hidden="true">↗</span></Link></div>
   </div>
  </section>
 </main>;
}
