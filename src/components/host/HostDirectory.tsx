"use client";
import {useMemo,useState} from 'react';
import Link from 'next/link';
import {HostAvatar} from './HostAvatar';
import {HostIcon} from './HostChrome';
import {HOST_WEEKDAYS,getTodayInLosAngeles,isHostConfirmed} from '@/lib/hostPresentation';
import {useListReturn} from '@/components/v2/listReturn';
import type {HostProfile} from '@/types';
export function HostDirectory({hosts}:{hosts:HostProfile[]}){
 const [filters,setFilters]=useState({query:''});useListReturn(filters,setFilters);
 const visible=useMemo(()=>hosts.filter(host=>[host.publicDisplayName,host.bio,...host.primaryAreas,...host.vibeTags,...Object.values(host.schedule).flatMap(gigs=>gigs.map(gig=>gig.venueName+' '+gig.neighborhood))].some(value=>value?.toLowerCase().includes(filters.query.toLowerCase().trim()))),[hosts,filters]);
 const today=HOST_WEEKDAYS.indexOf(getTodayInLosAngeles());
 return <section data-page-surface="" className="host-directory-body"><div className="host-directory-toolbar"><div><h2>FIND YOUR HOST</h2><p>{visible.length} local {visible.length===1?'host':'hosts'}</p></div><label className="host-search"><HostIcon name="search" /><span className="sr-only">Search hosts by name, venue, neighborhood, or vibe</span><input id="host-search" type="search" placeholder="Search KJs, venues, neighborhoods…" value={filters.query} onChange={event=>setFilters({query:event.target.value})} /></label></div><div className="host-directory-grid">{visible.map(host=>{const day=Array.from({length:7},(_,offset)=>HOST_WEEKDAYS[(today+offset)%7]).find(day=>host.schedule[day].length);const gig=day?host.schedule[day][0]:undefined;return <Link className="host-directory-card" href={`/hosts/${host.slug}`} key={host.slug}><div className="host-card-heading"><HostAvatar host={host} /><div><p className="host-eyebrow">{isHostConfirmed(host)?'HOST CONFIRMED':'HOST'}</p><h3>{host.publicDisplayName}</h3><p>{host.primaryAreas.join(' / ')||'San Diego'}</p></div></div>{host.bio&&<p className="host-card-bio">{host.bio}</p>}<div className="host-vibes">{host.vibeTags.slice(0,3).map(tag=><span key={tag}>{tag}</span>)}</div><div className="host-card-next"><p className="host-small-label">NEXT REGULAR NIGHT</p>{gig?<><strong>{day} · {gig.venueName}</strong><p>{gig.time}</p></>:<p>Schedule being confirmed</p>}</div><span className="host-card-cta">View host profile <HostIcon name="chevron_right" /></span></Link>;})}</div>{!visible.length&&<p className="host-empty">{hosts.length?'No hosts match your search.':'Host profiles are being confirmed. Get listed to add yours.'}</p>}</section>;
}
