# SingHUB UI 2.0 Prototype Recovery Manifest

This file records the authoritative prototype identifiers and prior source-bundle location so the approved UI cannot be lost in chat history.

## Active Site artifact
- Name: SingHUB UI 2.0 Prototype
- Live URL: https://singhub-ui-2-prototype.whiteinkcreates.chatgpt.site
- Site project ID: appgprj_6aba05dd7298819187c2a01d61bdbc46
- Site slug: singhub-ui-2-prototype
- Source version number: 37
- Projection revision: 74
- Status: active

## Prior authoritative source bundle
A prior Work session explicitly preserved the finished prototype as:
- Filename: singhub-ui-sep29-v02.tar.gz
- Size: approximately 24 MB
- Prior Work scratch path: /workspace/scratch/d1fd7f01c3c1/singhub-ui-sep29-v02.tar.gz
- Prior sandbox URI: sandbox:/workspace/scratch/d1fd7f01c3c1/singhub-ui-sep29-v02.tar.gz

The bundle was described as containing:
- Discovery homepage
- Venue directory
- Redwing Lit Up / enhanced venue
- Hotel experience
- My SingHUB / My Jacket
- design-system board
- final hero assets
- SH pins
- @ mark
- jacket assets
- patches
- wordmarks

## Recovery rule
Do not recreate the approved UI from memory or screenshots while the Site project or source bundle can be recovered.

Preferred recovery order:
1. Recover the source for Site project `appgprj_6aba05dd7298819187c2a01d61bdbc46`, source version 37.
2. If the Site source export is unavailable, recover `singhub-ui-sep29-v02.tar.gz` from the prior Work workspace/history.
3. Port that source literally into the production recovery branch and replace prototype data/state with production adapters.
4. Use the live Site as the visual acceptance reference.

## Current production recovery branch
- `fix/singhub-v2-production-system`
- Visual contract: `docs/singhub-v2-visual-contract.md`

Do not merge the production recovery branch until the migrated UI passes side-by-side fidelity QA against the authoritative prototype.
