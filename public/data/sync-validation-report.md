# SingHUB Data Sync Validation Report

Generated from the latest locally available canonical export. A live refresh was blocked by DNS in this environment.
Venue tab: Venues_Canonical.
Event tab: Events_Canonical.
Exported venues: 64.
Exported events: 26.

## Generated Venue Schedule Events (disabled; Events_Canonical only)
- None
## Rows Currently Blocked From Public Export
- event row 12: event-0011 - venue_slug diversionary-theatre-clark-cabaret-bar does not match existing venue-0077 slug clark-cabaret
- event rows 18-19: event-0017 and event-0018 - app_visible is false
- event rows 26 and 28: malformed All Mic Long updates for existing Gingers and Kaminski’s rows - app_visible is false
- venue duplicate: venue-0017 Pal Joey’s (pal-joeys) hidden in favor of venue-0045 Pal Joey’s Cocktail Lounge (pal-joeys-cocktail-lounge)
## Public Output Validation Failures
- None
## Public Venues Missing Exported Coordinates
- venue-0027 Cheers Bar San Diego (cheers-bar-san-diego)
- venue-0075 Chula Vista Brewery (chula-vista-brewery)
- venue-0059 Coin-Op Game Room (coin-op-game-room)
- venue-0082 Deano's Pub - Santee (deanos-pub-santee)
- venue-0077 Clark Cabaret (clark-cabaret)
- venue-0073 Dock's Cocktail Lounge (docks-cocktail-lounge)
- venue-0042 Gaslamplighter Karaoke Cocktail Bar (gaslamplighter)
- venue-0078 Good News Bar (good-news-bar)
- venue-0003 Hearth House (hearth-house)
- venue-0048 Hive Karaoke (hive-karaoke)
- venue-0081 Joycee's Cocktails (joycees-cocktails)
- venue-0071 Kaminski's Sports Lounge (kaminskis-sports-lounge)
- venue-0004 Norms (norms)
- venue-0076 Novo Brazil Brewing - Lane Ave (novo-brazil-brewing-lane-ave)
- venue-0074 On The Rocks Cocktails (on-the-rocks-cocktails)
- venue-0045 Pal Joey's Cocktail Lounge (pal-joeys-cocktail-lounge)
- venue-0038 Peter D's (peter-ds)
- venue-0052 Rooftop bar (downtown hotel) (rooftop-bar-downtown-hotel)
- venue-0050 Saddle Bar (saddle-bar)
- venue-0049 Spot KTV (spot-ktv)
- venue-0080 The Mesa (the-mesa-la-mesa)
- venue-0079 The Scoreboard Imperial Beach Sports Bar & Grill (the-scoreboard-imperial-beach-sports-bar-grill)
- venue-0072 The Search Bar (the-search-bar)
- venue-0008 Whiskey Girl (whiskey-girl)
- venue-0036 Wong's Golden Palace (wongs-golden-palace)
- venue-0083 Tony’s Martini Bar (tonys-martini-bar)
- venue-0084 Side Piece Bar (side-piece-bar)
- venue-0085 Hennessey’s La Jolla (hennesseys-la-jolla)
- venue-0087 Sessions By The Bay (sessions-by-the-bay)
## Venues Using Runtime coordinateFallbacksBySlug
- venue-0027 Cheers Bar San Diego (cheers-bar-san-diego)
- venue-0075 Chula Vista Brewery (chula-vista-brewery)
- venue-0059 Coin-Op Game Room (coin-op-game-room)
- venue-0082 Deano's Pub - Santee (deanos-pub-santee)
- venue-0077 Clark Cabaret (clark-cabaret)
- venue-0073 Dock's Cocktail Lounge (docks-cocktail-lounge)
- venue-0042 Gaslamplighter Karaoke Cocktail Bar (gaslamplighter)
- venue-0078 Good News Bar (good-news-bar)
- venue-0003 Hearth House (hearth-house)
- venue-0048 Hive Karaoke (hive-karaoke)
- venue-0081 Joycee's Cocktails (joycees-cocktails)
- venue-0071 Kaminski's Sports Lounge (kaminskis-sports-lounge)
- venue-0004 Norms (norms)
- venue-0076 Novo Brazil Brewing - Lane Ave (novo-brazil-brewing-lane-ave)
- venue-0074 On The Rocks Cocktails (on-the-rocks-cocktails)
- venue-0045 Pal Joey's Cocktail Lounge (pal-joeys-cocktail-lounge)
- venue-0038 Peter D's (peter-ds)
- venue-0052 Rooftop bar (downtown hotel) (rooftop-bar-downtown-hotel)
- venue-0050 Saddle Bar (saddle-bar)
- venue-0049 Spot KTV (spot-ktv)
- venue-0080 The Mesa (the-mesa-la-mesa)
- venue-0079 The Scoreboard Imperial Beach Sports Bar & Grill (the-scoreboard-imperial-beach-sports-bar-grill)
- venue-0072 The Search Bar (the-search-bar)
- venue-0008 Whiskey Girl (whiskey-girl)
- venue-0036 Wong's Golden Palace (wongs-golden-palace)
## Event Hosts Missing Host Profiles
- event-0001: America at The Lamplighter (Sunday)
- event-0002: America at The Lamplighter (Monday)
- event-0003: Raya at The Lamplighter (Tuesday)
- event-0004: Leo at The Lamplighter (Wednesday)
- event-0005: America / Leo at The Lamplighter (Thursday)
- event-0006: Ryan / Leo at The Lamplighter (Friday)
- event-0007: Ryan / Leo at The Lamplighter (Saturday)
- event-0008: Bryon.Bea at Redwing Bar & Grill (Friday)
- event-0009: Bryon.Bea at Redwing Bar & Grill (Saturday)
- event-0013: DJ 2Cold (@Noel_Colding) at The Scoreboard Imperial Beach Sports Bar & Grill (Friday)
- event-0014: Corey Glasper at Winstons Beach Club (Friday)
- event-0015: Bryon.Bea (@Bryon.Bea) at The Mesa (Wednesday)
- event-0016: Javier / DJ Harvest at Joycee's Cocktails (Wednesday)
- event-0021: All Mic Long at Tony’s Martini Bar (Sunday)
- event-0022: All Mic Long at Tony’s Martini Bar (Wednesday)
- event-0023: All Mic Long at Side Piece Bar (Wednesday)
- event-0024: All Mic Long at Hennessey’s La Jolla (Thursday)
- event-0026: All Mic Long at Sessions By The Bay (Thursday)
## Host Profile Schedule Entries Missing Events_Canonical
- Savor Entertainment: Sunday - The Lamplighter | 9:00 PM | Mission Hills | lamplighter
- Savor Entertainment: Friday - The Cordova Bar | 8:00 PM | Bay Park | cordova-bar
- Karaoke Karl: Monday - Redwing | 9:30 PM | Hillcrest | redwing
## Known-Issue Checks
- Norm’s has no exported Wednesday event because no valid visible Events_Canonical row is present; the former row was venue-schedule fallback data.
- Pal Joey’s exports once as venue-0045 / pal-joeys-cocktail-lounge.
- Visible All Mic Long events reference existing venue IDs; Gingers and Kaminski’s updates remain blocked because their imported event rows are app-hidden/malformed.
