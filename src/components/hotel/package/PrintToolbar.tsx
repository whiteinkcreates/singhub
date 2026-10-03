'use client';
export function PrintToolbar(){return <nav className="print-toolbar" style={{padding:16,background:'#101827',color:'white',display:'flex',gap:20}}><button type="button" onClick={()=>window.print()}>Print / Save as PDF</button><span>US Letter · 100% scale · no margins · background graphics on · browser headers off</span></nav>;}
