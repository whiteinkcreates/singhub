"use client";
import { useEffect } from "react";
import { isExternalWebUrl } from "@/lib/navigation";

/** Keep SingHUB open when a singer follows a third-party signup or venue link. */
export function OutboundLinks() {
  useEffect(() => {
    const originalAttributes = new WeakMap<Element, { target: string | null; rel: string | null }>();
    function prepare(node: Node) {
      if (!(node instanceof Element)) return;
      const links = node.matches("a[href]") ? [node, ...node.querySelectorAll("a[href]")] : node.querySelectorAll("a[href]");
      for (const link of links) {
        if (link.hasAttribute("download") || !isExternalWebUrl(link.getAttribute("href") || "", window.location.origin)) {
          const original = originalAttributes.get(link);
          if (original) {
            for (const attribute of ["target", "rel"] as const) {
              const value = original[attribute];
              if (value === null) link.removeAttribute(attribute); else link.setAttribute(attribute, value);
            }
            originalAttributes.delete(link);
          }
          continue;
        }
        if (!originalAttributes.has(link)) originalAttributes.set(link, { target: link.getAttribute("target"), rel: link.getAttribute("rel") });
        link.setAttribute("target", "_blank");
        const rel = new Set((link.getAttribute("rel") || "").split(/\s+/).filter(Boolean));
        rel.add("noopener"); rel.add("noreferrer");
        link.setAttribute("rel", [...rel].join(" "));
      }
    }
    prepare(document.body);
    const prepareClick = (event: MouseEvent) => {
      const link = event.target instanceof Element ? event.target.closest("a[href]") : null;
      if (link) prepare(link);
    };
    document.addEventListener("click", prepareClick, true);
    const observer = new MutationObserver(records => {
      for (const record of records) {
        if (record.type === "attributes") prepare(record.target);
        else record.addedNodes.forEach(prepare);
      }
    });
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["href"] });
    return () => { observer.disconnect(); document.removeEventListener("click", prepareClick, true); };
  }, []);
  return null;
}
