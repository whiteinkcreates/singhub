'use client';
import {FollowVenue} from './FollowVenue';
import './styles/venueEngagement.css';

type Props={venueId:string;venueSlug:string;venueName:string;canFollow:boolean};
export function VenueQuickActions({venueId,venueSlug,venueName,canFollow}:Props){
 return <nav className="venue-quick-actions" aria-label="Venue quick actions">
  {canFollow?<FollowVenue venueId={venueId} venueSlug={venueSlug} venueName={venueName}/>:null}
  <button type="button" data-toast="Venue saved">Save</button>
  <button type="button" data-toast="Share sheet opened">Share</button>
  <button type="button" data-toast="Directions opened">Directions</button>
 </nav>;
}
