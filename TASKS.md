# SingHUB Phase 1 Tasks

## Setup & Foundation

### T1: Create project file structure
- [ ] Create `src/components/` directory for reusable components
- [ ] Create `src/data/` directory for mock data
- [ ] Create `src/types/` directory for TypeScript types
- [ ] Create `src/utils/` directory for utility functions
- [ ] Create `src/app/layout.tsx` with global styling (if not exists)

### T2: Define core types
- [ ] Create `src/types/venue.ts` with VenueBasic interface
- [ ] Create `src/types/form.ts` with form submission types
- [ ] Export types for use across components

### T3: Create mock data
- [ ] Create `src/data/venues.ts` with 12-20 San Diego karaoke venues
- [ ] Include realistic data:
  - Names (actual SD venues or realistic alternatives)
  - Addresses (San Diego neighborhoods)
  - Phone numbers
  - Hours with karaoke timing
  - Amenities
  - Photos (placeholder image URLs)
- [ ] Ensure data matches VenueBasic interface

### T4: Setup shared components
- [ ] Create `Navigation.tsx` (header/nav bar)
- [ ] Create `Footer.tsx` with links
- [ ] Create `VenueCard.tsx` for venue list items
- [ ] Create `VenueDetailCard.tsx` for full venue info
- [ ] Create `FormSubmission.tsx` wrapper for form handling
- [ ] Create `Button.tsx` reusable button component

---

## Page Implementation

### T5: Homepage (`/`)
- [ ] Create `src/app/page.tsx` with hero section
- [ ] Add search/CTA section pointing to /find
- [ ] Display 3-4 featured venues (randomly selected from mock data)
- [ ] Add "Add Your Venue" section with link to /submit-listing
- [ ] Add SingHUB Scout teaser with link to /scout
- [ ] Style with Tailwind CSS

### T6: Find Karaoke page (`/find`)
- [ ] Create `src/app/find/page.tsx`
- [ ] Display all venues from mock data in grid/list
- [ ] Add search input (filter by venue name)
- [ ] Add links to individual venue detail pages
- [ ] Add "Submit Listing" button/link
- [ ] Add responsive grid layout

### T7: Venue detail page (`/venues/[id]`)
- [ ] Create `src/app/venues/[id]/page.tsx`
- [ ] Fetch venue data by ID from mock data
- [ ] Display all venue information
- [ ] Show photo gallery
- [ ] Display amenities checklist
- [ ] Display karaoke hours
- [ ] Add action buttons: Call, Visit Website, Claim, Report
- [ ] Handle 404 for missing venues
- [ ] Add back navigation

### T8: Submit Listing page (`/submit-listing`)
- [ ] Create `src/app/submit-listing/page.tsx`
- [ ] Build form with fields:
  - Venue name (required)
  - Address (required)
  - Phone (optional)
  - Website (optional)
  - Description
  - Karaoke hours
  - Amenities checkboxes
  - Contact email
  - Photo upload (optional)
- [ ] Add form validation
- [ ] Handle form submission (log to console)
- [ ] Show success message on submit

### T9: Claim Listing page (`/claim-listing`)
- [ ] Create `src/app/claim-listing/page.tsx`
- [ ] Build form with fields:
  - Venue name
  - Phone number
  - Owner name
  - Owner email
  - Current description
- [ ] Add form validation
- [ ] Handle form submission (log to console)
- [ ] Show success message on submit

### T10: Premium Profile page (`/premium-profile`)
- [ ] Create `src/app/premium-profile/page.tsx`
- [ ] Build form with fields:
  - Venue name (required)
  - Logo upload
  - Multiple photo uploads (up to 15)
  - Detailed description
  - Social media links (Instagram, Facebook)
  - Events/promotions textarea
  - Song database details
- [ ] Add form validation
- [ ] Handle form submission (log to console)
- [ ] Show success message on submit
- [ ] Option to preview enhanced profile

### T11: SingHUB Scout page (`/scout`)
- [ ] Create `src/app/scout/page.tsx`
- [ ] Add "What is SingHUB Scout?" section
- [ ] Explain venue discovery program
- [ ] List benefits of being featured
- [ ] Include FAQ accordion
- [ ] Call-to-action button linking to /submit-listing

---

## Styling & Responsive Design

### T12: Global styling
- [ ] Configure Tailwind CSS properly
- [ ] Set up global fonts in layout.tsx
- [ ] Define color palette for SingHUB brand
- [ ] Create CSS variables if needed

### T13: Mobile responsiveness
- [ ] Test all pages on mobile (375px width)
- [ ] Test on tablet (768px width)
- [ ] Test on desktop (1024px+ width)
- [ ] Use Tailwind responsive classes (sm:, md:, lg:)
- [ ] Ensure touch-friendly buttons on mobile
- [ ] Fix navigation on mobile

### T14: Accessibility
- [ ] Add alt text to all images
- [ ] Use semantic HTML elements
- [ ] Test keyboard navigation
- [ ] Ensure sufficient color contrast
- [ ] Use ARIA labels where needed

---

## Testing & Quality

### T15: Code quality
- [ ] Run `npm run lint` and fix all issues
- [ ] Check TypeScript compilation (`tsc --noEmit`)
- [ ] No console errors in browser DevTools
- [ ] No missing dependencies

### T16: Functional testing
- [ ] All links navigate correctly
- [ ] All forms validate properly
- [ ] Search/filter works on Find Karaoke page
- [ ] Venue detail pages load correct data
- [ ] Images load without errors
- [ ] Responsive layout works at all breakpoints

### T17: Performance
- [ ] Check bundle size is reasonable
- [ ] Images optimized (use Next.js Image component)
- [ ] No memory leaks in component mounting
- [ ] Fast page navigation (Next.js optimizations)

---

## Documentation & Cleanup

### T18: Update documentation
- [ ] Update README.md with build/run instructions
- [ ] Document how to add new venues to mock data
- [ ] Document page structure and routing
- [ ] Add component documentation

### T19: Cleanup & finalize
- [ ] Remove placeholder/unused files
- [ ] Remove console.log statements (except form submissions)
- [ ] Commit all changes with clear messages
- [ ] Ready for Phase 2 (Supabase integration)

---

## Task Grouping for Implementation

### Sprint 1: Setup
- T1, T2, T3, T4

### Sprint 2: Pages Part 1
- T5, T6, T7

### Sprint 3: Pages Part 2
- T8, T9, T10, T11

### Sprint 4: Polish
- T12, T13, T14, T15, T16, T17, T18, T19

---

## Priority Matrix

| Task | Priority | Effort | Status |
|------|----------|--------|--------|
| T1-T4 (Setup) | 🔴 High | Small | Not started |
| T5-T6 (Core pages) | 🔴 High | Medium | Not started |
| T7 (Venue detail) | 🔴 High | Medium | Not started |
| T8-T11 (Forms) | 🟡 Medium | Medium | Not started |
| T12-T14 (Styling) | 🟡 Medium | Large | Not started |
| T15-T19 (QA) | 🟢 Low | Large | Not started |

---

## Notes
- Forms capture submissions but don't persist anywhere (Phase 2 will add Supabase)
- All venue data is hardcoded mock data (Phase 2 will add database)
- No authentication or user accounts (Phase 3 will add this)
- Each task should include TypeScript type safety
- Focus on Tailwind CSS for styling, avoid custom CSS

