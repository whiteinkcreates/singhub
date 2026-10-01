"use client";
import { useId, useRef } from "react";
import type { HotelPhotoCredit as Credit } from "@/lib/hotelPhotoCredit";
import styles from "./HotelPhotoCredit.module.css";
export function HotelPhotoCredit({ credit }: { credit?: Credit }) {
  const id = useId();
  const panel = useRef<HTMLDivElement>(null);
  if (!credit) return null;
  function show() { panel.current?.showPopover(); }
  return <div className={styles.control}>
    {credit.status !== "licensed" && <span className={styles.badge}>{credit.status === "illustrative" ? "Illustrative concept" : "Internal demo · permission pending"}</span>}
    <button type="button" className={styles.trigger} popoverTarget={id} onMouseEnter={show} onFocus={event => { if (event.currentTarget.matches(":focus-visible")) show(); }} onClick={event => { event.preventDefault(); show(); }}>Photo credit ⓘ</button>
    <div ref={panel} id={id} popover="auto" className={styles.popup}>
      <strong>{credit.attribution}</strong>
      {credit.license && <p><a href={credit.licenseUrl} target="_blank" rel="noopener noreferrer">{credit.license}</a></p>}
      <p>{credit.note}</p>
      <a href={credit.sourceUrl} target="_blank" rel="noopener noreferrer">View original source ↗</a>
      <button type="button" popoverTarget={id} popoverTargetAction="hide" className={styles.close} aria-label="Close photo credit">Close</button>
    </div>
  </div>;
}
