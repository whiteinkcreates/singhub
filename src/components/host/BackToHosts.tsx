/* Full navigation restores saved filters and scroll through the existing list-return service. */
/* eslint-disable @next/next/no-html-link-for-pages */
"use client";
import { HostIcon } from './HostChrome';
export function BackToHosts(){return <a href="/hosts" className="host-back" onClick={()=>{try{sessionStorage.setItem('singhub:restore-list','/hosts');}catch{}}}><HostIcon name="chevron_left" />Back to Hosts</a>;}
