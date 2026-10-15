/** Reviewed venue activities from existing SingHUB source records and venue websites.
 * Sports viewing means facilities/programming, NEVER a guarantee a particular game airs.
 * UFC stays empty until a current event-specific screening is verified.
 */
export const backyardActivities=[
 {slug:"football",name:"Football",area:"Game Day Tent",description:"Find sports-friendly karaoke bars. Confirm the game with the venue.",icon:"🏈"},
 {slug:"basketball",name:"Basketball",area:"Game Day Tent",description:"Catch basketball where there's also a mic nearby.",icon:"🏀"},
 {slug:"ufc",name:"UFC",area:"Game Day Tent",description:"Find confirmed fight-night screenings as venues verify them.",icon:"🥊"},
 {slug:"live-music",name:"Live Music",area:"Live Music Stage",description:"Bands, jams and open mic nights.",icon:"🎸"},
 {slug:"trivia",name:"Trivia",area:"Game Shack",description:"Team up for a different kind of spotlight.",icon:"🧠"},
 {slug:"bingo",name:"Bingo",area:"Game Shack",description:"Find game nights beyond the mic.",icon:"🎟️"},
 {slug:"pool-games",name:"Pool & Games",area:"Game Shack",description:"Pool, darts, arcade games and more.",icon:"🎱"},
 {slug:"specials",name:"Food & Specials",area:"The Concessions",description:"A reason to arrive early or stay late.",icon:"🍔"}
] as const;
export type BackyardActivity=typeof backyardActivities[number]["slug"];
export type BackyardOffer={slug:string;activities:BackyardActivity[];highlights:string[];source:string};
export const backyardVenueOffers:BackyardOffer[]=[
 {slug:"cheers-bar-san-diego",activities:["football","basketball","trivia","pool-games","specials"],highlights:["Sports on TV","Thursday trivia","Pool table","Sunday BBQ"],source:"https://cheerssandiego.com/events"},
 {slug:"deanos-pub",activities:["football","basketball","bingo","pool-games","live-music","specials"],highlights:["Sports viewing","Dirty Bingo","Pool and shuffleboard","Live music"],source:"https://deanospub.com/"},
 {slug:"full-circle-saloon",activities:["football","basketball","live-music","pool-games","specials"],highlights:["Sports bar","Live music","Pool, darts and shuffleboard"],source:"https://fullcirclesaloon.com/"},
 {slug:"710-beach-club",activities:["trivia","live-music","specials"],highlights:["Trivia","Open mic","Saturday bands"],source:"https://www.710bc.com/events"},
 {slug:"mcguffies-live",activities:["live-music","bingo","pool-games"],highlights:["Live bands","Blues jams","Bingo tournaments"],source:"https://mcguffieslive.com/shows"},
 {slug:"camels-bar-grill",activities:["live-music","bingo","pool-games"],highlights:["Blues jam","Bingo","Darts and cornhole"],source:"https://camelsbarandgrill.com/"},
 {slug:"grand-comedy-club",activities:["trivia","bingo","live-music"],highlights:["Comedy and open mic","Trivia","Music bingo"],source:"https://www.grandcomedyclub.com/"},
 {slug:"hearth-house",activities:["trivia","live-music","pool-games","specials"],highlights:["Tuesday trivia","Sunday country music","Pool and darts"],source:"https://hearthhousebar.com/happenings"},
 {slug:"urban-mos-bar-grill",activities:["bingo","trivia","live-music","specials"],highlights:["Drag brunch","Bingo","Trivia"],source:"https://urbanmos.com/events/"},
 {slug:"richs-san-diego",activities:["live-music"],highlights:["DJ events","Drag shows"],source:"https://richssandiego.com/calendar/"},
 {slug:"bns-brewing-distilling-co",activities:["trivia","live-music","pool-games"],highlights:["Trivia","Cornhole","Live bands"],source:"https://www.bnsbrewinganddistillingco.com/event-list"},
 {slug:"double-deuce",activities:["pool-games","live-music"],highlights:["Mechanical bull","Country DJ nights"],source:"https://doubledeucesd.com/"},
 {slug:"punch-bowl-social-san-diego",activities:["pool-games","specials"],highlights:["Bowling","Shuffleboard","Arcade"],source:"https://punchbowlsocial.com/location/san-diego"},
 {slug:"coyote-bar-grill-carlsbad",activities:["live-music"],highlights:["Live bands","DJ nights"],source:"https://coyotecarlsbad.com/events/"},
 {slug:"n-city-sports-lounge",activities:["football","basketball","pool-games","live-music"],highlights:["Sports viewing","Pool","DJ events"],source:"https://ncitysportslounge.com/national-city-n-city-sports-lounge-events"},
 {slug:"star-bar",activities:["pool-games","live-music","specials"],highlights:["Pool tournaments","Weekend DJs","Happy hour"],source:"https://starbarsd.com/events/"},
 {slug:"side-piece-bar",activities:["football","pool-games","specials"],highlights:["Football viewing","Pool","Happy hour"],source:"https://www.bemysidepiece.com/"},
 {slug:"jps-pub-tierrasanta",activities:["football","basketball","pool-games","live-music"],highlights:["Sports on TVs","Pool tables","Saturday bands"],source:"https://jpspubsd.com/"},
 {slug:"harbor-town-pub",activities:["football","basketball","trivia","bingo","pool-games"],highlights:["Sports watch parties","Trivia","Arcade","Bingo"],source:"https://harbortownpub.com/"},
 {slug:"pal-joeys",activities:["football","basketball","live-music","pool-games","specials"],highlights:["Sports on TVs","Live bands","Pool tables"],source:"https://paljoeys.net/"},
 {slug:"redwing-bar-grill",activities:["football","basketball","trivia","specials"],highlights:["Sports on TVs","Thursday trivia","Daily happy hour"],source:"https://redwingbar.com/"},
 {slug:"the-luau",activities:["bingo","specials"],highlights:["Monday bingo","Tiki specials"],source:"https://www.theluaubar.com/"},
 {slug:"the-mesa",activities:["football","basketball","pool-games","live-music","specials"],highlights:["Game-day viewing","Cup pong","DJs","Brunch"],source:"https://www.mesabargrill.com/"},
 {slug:"the-ould-sod",activities:["pool-games","specials"],highlights:["Darts","Foosball","Jukebox"],source:"https://theouldsod.com/"},
 {slug:"werewolf",activities:["football","basketball","specials"],highlights:["Sports viewing","Brunch","Game-day wings"],source:"https://thewerewolf.net/happenings"},
 {slug:"saddle-bar",activities:["football","live-music"],highlights:["49ers watch bar","Thursday bands","Sunday open mic"],source:"https://thesaddlebar.com/"},
 {slug:"shooters-cocktails",activities:["pool-games","live-music","specials"],highlights:["Pool tables","Beer pong tournament","Live bands"],source:"https://www.shooterscocktailsbar.com/"},
 {slug:"u-31",activities:["trivia","pool-games","live-music"],highlights:["Thursday trivia","Pool","Weekend DJs"],source:"https://u31bar.com/"},
 {slug:"the-north-bar-escondido",activities:["football","basketball","pool-games","live-music"],highlights:["Sports on TV","Darts","Live bands"],source:"https://www.thenorthbar.com/"},
 {slug:"rosie-ogradys",activities:["trivia","football","basketball","live-music","specials"],highlights:["Trivia","Sports viewing","Live music"],source:"https://rosieogradyssd.com/"},
 {slug:"flicks",activities:["live-music"],highlights:["DJ events"],source:"https://www.sdflicks.com/"}
];
export const backyardOfferBySlug=new Map(backyardVenueOffers.map(venue=>[venue.slug,venue]));
