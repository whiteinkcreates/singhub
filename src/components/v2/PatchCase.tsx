"use client";
import {useState} from "react";
import type {Achievement} from "@/lib/v2/singerAccount";
import {PATCH_RULES} from "@/lib/v2/patchCatalog";

/** The case is the current achievement catalog, never a hard-coded fake badge list. */
export function PatchCase({awards}:{awards:Achievement[]}) {
 const [selected,setSelected]=useState<string|null>(null);
 const earned = new Map(awards.map(award=>[award.badge_key,award]));
 const legacy=awards.filter(award=>!PATCH_RULES.some(rule=>rule.key===award.badge_key));
 const rules=[...PATCH_RULES,...legacy.map(award=>({
   key:award.badge_key,name:award.badge_name,
   category:"Community" as const,howToEarn:"Previously awarded SingHUB patch.",
 }))];
 const current=rules.find(rule=>rule.key===selected);
 return <div className="patch-case-content">
   <p className="patch-case-intro">Earned patches are lit up. Explore the washed-out patches to see how to earn them.</p>
   <div className="patches patch-catalog-list" aria-label="Available SingHUB achievement patches" role="group">
     {rules.map(rule=>{
       const award=earned.get(rule.key);
       const isEarned=Boolean(award);
       return <button key={rule.key} type="button"
         className={"patch patch-catalog-item"+(isEarned?" earned":" locked")}
         aria-pressed={selected===rule.key} onClick={()=>setSelected(rule.key)}>
           <span className="patch-case-icon" aria-hidden="true">{isEarned?"★":"☆"}</span>
           <b>{rule.name}</b>
           <span>{isEarned?"Earned · "+rule.category:"Not yet earned · "+rule.category}</span>
           <small>{rule.howToEarn}</small>
         </button>;
     })}
   </div>
   {current&&<div className="patch-case-detail" role="status">
     <strong>{current.name}{earned.has(current.key)?" · Earned":" · Locked"}</strong>
     <p>{current.howToEarn}</p>
   </div>}
   <div className="patch-rule">{awards.length} earned of {rules.length} available achievements. Performance Stars remain separate on your jacket sleeves.</div>
 </div>;
}
