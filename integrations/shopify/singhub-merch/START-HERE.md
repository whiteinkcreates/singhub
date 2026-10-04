# SingHUB Merch Table for the existing WhiteInk store

This is a Shopify theme add-on, not a full replacement theme. It creates a dedicated SingHUB page with the exact supplied neon wordmark, app navigation, Barlow typography, real collection products, variant selection and an in-page shopping bag. Shopify manages prices, inventory, payment and orders.

## Install in a duplicate of the current WhiteInk theme

1. Create or confirm a Shopify collection with handle `singhub`. Add the actual SingHUB products, publish them to the Online Store channel and arrange their order. Use standard one-time-purchase products. The page deliberately excludes products requiring subscription selling plans.
2. Copy each file into the matching theme directory: `layout/singhub.liquid`, `sections/singhub-merch-table.liquid`, `templates/page.singhub-merch.json`, and the three files under `assets/`. Keep the exact supplied `singhub-wordmark.png` file.
3. Create a Shopify page called **SingHUB Merch Table**, handle `singhub-merch`, and assign the `page.singhub-merch` template. In the theme editor, select the SingHUB collection. Edit the headline and introduction there if needed.
4. Preview on phone and desktop. Choose a size/color, add to the bag, change quantity, remove an item and continue to the real checkout. Confirm shipping, taxes, policies, payment, order email and fulfillment using Shopify's supported test-order mode. Publish the theme only after that flow passes.

## Connect the SingHUB button after the page is live

The intended page URL is:

`https://whiteinkcreates.com/pages/singhub-merch?utm_source=singhub&utm_medium=app&utm_campaign=merch_table&entry=account`

Open it in the same tab. The exact URL must return a real, populated page before enabling the currently disabled SingHUB Merch Table button. This package does not claim that page is already installed or that the app button is connected.

Allowed entry values: `account`, `discover`, `venues`, `hosts`, `hotels`, `singboard`. The fixed return destinations point only to singhub.app. The header account button stays My SingHUB; the separate return link can return to the original app section.

## What stays continuous

- SingHUB wordmark, colors, fonts, app header and mobile navigation.
- Dedicated shop page with no WhiteInk storefront header or homepage detour.
- Product selection and bag stay on the branded page.
- Browser-session cart persists across reloads through Shopify.
- Existing items in a shopper's WhiteInk cart remain visible and are never cleared.
- Guest shopping does not require a SingHUB account.
- No API keys or payment details are handled by SingHUB.

The browser address changes to WhiteInk's domain. Checkout is WhiteInk's Shopify checkout, controlled by that store's configuration. This add-on does not change store-wide checkout branding, taxes, returns, fulfillment or legal policies. Do not silently change those for WhiteInk's other customers.

## KJ and venue collaborations later

The same collection can include approved collaboration products later. Use Shopify product/vendor records and real approved artwork. This package does not create multi-seller accounts or automate revenue sharing. Agree ownership, permission, fulfillment, refunds and payouts before publishing partner products.

## Verification and source

The local/browser fixture renders the same Liquid section and loads the same production CSS and JavaScript. Test carts are isolated, create no store order and do not charge anyone. The review snapshot uses five public WhiteInk SingHUB listings retrieved October 4, 2026; availability and pricing at purchase must come from live Shopify.

Reference implementation: https://shopify.dev/docs/api/ajax/reference/cart

Theme sections: https://shopify.dev/docs/storefronts/themes/architecture/sections/section-schema

JSON templates: https://shopify.dev/docs/storefronts/themes/architecture/templates/json-templates

Checkout form: https://shopify.dev/docs/storefronts/themes/architecture/templates/cart
