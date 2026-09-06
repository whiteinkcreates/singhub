export type PollCategory = "karaoke-court" | "kill-one" | "this-or-that" | "song-battle" | "would-you-rather" | "confessions" | "open-mic" | "wild-card";
export type CaptionAngle = "punchy" | "funny" | "argument-starter";
export type PollQuestion = { slug:string; question:string; socialQuestion?:string; helper?:string; category:PollCategory; options:{id:string;label:string}[]; socialHook:string; captionAngle:CaptionAngle; spiciness:1|2|3|4|5 };
const q=(slug:string,question:string,category:PollCategory,labels:string[],socialHook:string,captionAngle:CaptionAngle="argument-starter",spiciness:1|2|3|4|5=3,socialQuestion?:string):PollQuestion=>({slug,question,socialQuestion,category,socialHook,captionAngle,spiciness,options:labels.map((label,i)=>({id:`option-${i+1}`,label}))});

export const POLL_BANK: PollQuestion[] = [
q("repeat-song","Someone already sang your song tonight. Can you still sing it?","karaoke-court",["Absolutely not","Only much later","Yes, do your version","Depends how well they did"],"Your song got taken. Is it actually gone?","argument-starter",4),
q("seven-minute-song","Is singing a 7-minute song at a packed karaoke bar a dick move?","karaoke-court",["Yes. Get off the stage.","Only if the rotation is packed","No. Commit to the bit","Free Bird is a human right"],"Court is now in session.","punchy",5),
q("kj-bump","Should a KJ ever change the rotation to keep the room energized?","karaoke-court",["Never","Sometimes","Only for a clear reason","KJ runs the room"],"Singers and KJs may want separate attorneys for this one.","argument-starter",5),
q("bar-singalong","Is it rude for the whole bar to sing along with the performer?","karaoke-court",["That's the best part","Chorus only","Read the room","Let the singer have it"],"Does backup from 40 strangers help or hijack the song?","funny",3),
q("kill-staple","One karaoke staple has to disappear forever. Kill one.","kill-one",["Sweet Caroline","Don't Stop Believin'","Friends in Low Places","Livin' on a Prayer"],"No appeals. No encore. One has to go.","punchy",5),
q("kill-group-song","One group singalong gets erased from karaoke. Kill one.","kill-one",["Mr. Brightside","I Want It That Way","What's Up?","Since U Been Gone"],"The guillotine only needs one name.","punchy",5),
q("kill-country","Country karaoke loses one forever. Kill one.","kill-one",["Before He Cheats","Friends in Low Places","Man! I Feel Like a Woman!","Save a Horse (Ride a Cowboy)"],"One song leaves the rotation in a tiny cowboy coffin.","funny",4),
q("kill-duet","One karaoke duet can never be performed again. Kill one.","kill-one",["Shallow","Islands in the Stream","Picture","Paradise by the Dashboard Light"],"Two singers enter. One song leaves.","punchy",4),
q("sound-vs-energy","What matters more at karaoke?","this-or-that",["Great sound","Great room energy"],"Perfect mix or a room losing its mind? Pick a side.","argument-starter",3),
q("voice-vs-stage","Who wins karaoke?","this-or-that",["Amazing voice, zero stage presence","Average voice, owns the room"],"Vocals versus vibes. There is no third option.","punchy",4),
q("early-vs-late","Best karaoke experience?","this-or-that",["Early, short rotation","Late, packed room"],"More songs or more chaos?","punchy",3),
q("solo-vs-duet","Pick your karaoke weapon.","this-or-that",["Solo","Duet"],"Share the spotlight or take the whole damn thing?","funny",2),
q("battle-80s-90s","Which decade wins karaoke?","song-battle",["80s","90s"],"Two decades enter the ring.","punchy",4),
q("battle-00s-10s","Which decade wins modern karaoke?","song-battle",["2000s","2010s"],"Millennial civil war begins now.","funny",4),
q("battle-boybands","Which boy-band anthem wins the bar?","song-battle",["I Want It That Way","Bye Bye Bye"],"This fight has choreography.","funny",4),
q("battle-rock","Which song owns a packed karaoke bar?","song-battle",["Mr. Brightside","Livin' on a Prayer"],"The room only has enough lungs for one.","punchy",4),
q("rather-lyrics-key","Would you rather...","would-you-rather",["Forget every lyric","Sing the whole song one key too high"],"Choose your karaoke nightmare.","funny",4),
q("rather-kj-pick","Would you take $500 if the KJ gets to choose your song?","would-you-rather",["Give me the money","Absolutely not"],"How much is your dignity worth tonight?","funny",4),
q("rather-empty-packed","Would you rather sing to...","would-you-rather",["An empty bar","A packed bar of strangers"],"Pick your preferred flavor of terror.","funny",3),
q("rather-first-last","Would you rather be...","would-you-rather",["First singer of the night","Last singer before close"],"Open the room or close the show?","punchy",3),
q("confession-bomb","Have you ever secretly hoped the singer before you would bomb?","confessions",["Yes","Never","Only if they were cocky","I plead the fifth"],"The booth is open. Confess.","funny",5),
q("confession-song-change","Have you ever changed your song because the singer before you was too good?","confessions",["Absolutely","Never","More than once","New fear unlocked"],"No judgment. Well, maybe a little.","funny",4),
q("confession-fake-bathroom","Have you ever disappeared when your name was called because you got nervous?","confessions",["Yep","Never","I considered it","That's what the bathroom is for"],"Karaoke sins are forgiven here.","funny",3),
q("confession-repeat","Have you ever sung a song you knew somebody else wanted?","confessions",["Yes","Never","Finders keepers","I didn't know, I swear"],"Time to confess your song theft.","argument-starter",4),
q("open-signature","What song is YOUR karaoke song?","open-mic",["Drop your song in the comments"],"No hedging. What's the song with your name on it?","argument-starter",2),
q("open-retire","What karaoke song never needs to be heard again?","open-mic",["Name the song"],"Welcome to the song complaint department.","argument-starter",5),
q("open-underrated","What's the most underrated karaoke song?","open-mic",["Give us your sleeper pick"],"We're looking for songs the room doesn't see coming.","argument-starter",3),
q("open-impressed","What song makes you immediately think, 'oh, this person came prepared'?","open-mic",["Name it"],"Some song choices announce themselves before the first note.","argument-starter",3),
q("wild-drinks","How many drinks produces peak karaoke confidence?","wild-card",["0","1-2","3-4","We have lost count"],"Science has failed us. Karaoke will finish the research.","funny",4),
q("wild-friend-bombing","Your friend is absolutely bombing. What do you do?","wild-card",["Cheer louder","Sing along","Film it","Suddenly need the bathroom"],"Friendship is being tested in real time.","funny",4),
q("wild-song-stolen","Someone starts singing YOUR signature song. Your first reaction?","wild-card",["Relieved","Furious","Judge silently","Challenge accepted"],"Your song has been stolen in broad daylight.","funny",4),
q("wild-one-song","You only get ONE song tonight. What's the objective?","wild-card",["Show off my voice","Win the crowd","Maximum fun","Emotional damage"],"One song. Choose your mission.","punchy",3),
];

function dateKeyInLosAngeles(date=new Date()){return new Intl.DateTimeFormat("en-CA",{timeZone:"America/Los_Angeles",year:"numeric",month:"2-digit",day:"2-digit"}).format(date)}
function dayNumber(dateKey:string){const [year,month,day]=dateKey.split("-").map(Number);return Math.floor(Date.UTC(year,month-1,day)/86400000)}
export function getPollForDate(date=new Date()){const key=dateKeyInLosAngeles(date);const index=((dayNumber(key)%POLL_BANK.length)+POLL_BANK.length)%POLL_BANK.length;return POLL_BANK[index]}
export function getPreviousPoll(date=new Date()){return getPollForDate(new Date(date.getTime()-86400000))}
export function getPollBySlug(slug:string){return POLL_BANK.find(poll=>poll.slug===slug)}
export function buildPollCaption(poll:PollQuestion,voteUrl="https://singhub.app/vote"){const options=poll.options.length>1?`\n\n${poll.options.map(o=>o.label).join(" • ")}`:"";const endings:Record<CaptionAngle,string>={punchy:"Pick one. Then go see what everyone else chose.",funny:"Make your choice. Defend the damage in the comments.","argument-starter":"Vote first. Then make your case in the comments."};return `${poll.socialHook}\n\n${poll.socialQuestion||poll.question}${options}\n\n${endings[poll.captionAngle]}\n\nVote + see the results → ${voteUrl}`}
