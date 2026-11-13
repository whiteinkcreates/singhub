/** A lightweight, accessible decorative mark.
 * Glass-tube neon is CSS based, without a generated/mockup SVG asset.
 * A pulse indicates a scheduled karaoke night matching the current nightlife day.
 */
export function BackyardNeonMic({pulse=false}:{pulse?:boolean}) {
 return <span aria-hidden="true" className={"backyard-neon-mic"+(pulse?" backyard-neon-mic--tonight":"")}>
  <span className="backyard-neon-mic__head"/>
  <span className="backyard-neon-mic__frame"/>
  <span className="backyard-neon-mic__stem"/>
  <span className="backyard-neon-mic__base"/>
 </span>;
}
