# SingHUB Roadmap

## Phase 1: MVP - Karaoke Venue Finder (In Progress)

**Goal:** Build a functional karaoke venue discovery platform for San Diego using mock data, with zero backend integration or authentication.

**Timeline:** Current phase (2026 Q2)

### Phase 1 Deliverables

#### Milestone 1: Core Pages & Layout
- [ ] Homepage with hero and featured venues
- [ ] Find Karaoke page with venue list
- [ ] Venue detail page with full information
- [ ] SingHUB Scout explanation page
- [ ] Responsive navigation (mobile-friendly)

#### Milestone 2: Venue Submission & Claiming
- [ ] Submit Listing page (form captures data)
- [ ] Claim Listing page (form captures data)
- [ ] Premium Profile Creation page (form captures data)
- [ ] Form validation on all submission pages
- [ ] Success messages/confirmation (temporary)

#### Milestone 3: Mock Data & Integration
- [ ] Create comprehensive mock venue dataset (12-20 venues)
- [ ] Integrate mock data across Find Karaoke page
- [ ] Display proper venue details on detail pages
- [ ] Ensure all data fields render correctly

#### Milestone 4: Polish & Testing
- [ ] Responsive design verified (mobile, tablet, desktop)
- [ ] All navigation links working
- [ ] All pages render without errors
- [ ] Tailwind styling consistent across pages
- [ ] Image assets prepared

### Success Criteria
✅ All 8 pages built and functional  
✅ Mock data displays correctly  
✅ Forms capture submissions (logged to console/temp storage)  
✅ Mobile-responsive layout  
✅ No database/auth required  
✅ No build errors or TypeScript issues  

---

## Phase 2: Backend & Data Persistence (Future)

**Goal:** Add Supabase integration and persistent data storage

### Features to Add
- [ ] Supabase PostgreSQL setup
- [ ] Database schema for venues, submissions, claims
- [ ] API routes for form submissions
- [ ] Real data persistence (not mock)
- [ ] Venue search/filtering from database
- [ ] Admin panel for moderation

---

## Phase 3: Authentication & Owner Tools (Future)

**Goal:** Enable venue owners to manage their listings

### Features to Add
- [ ] User authentication (email/password)
- [ ] Venue owner dashboard
- [ ] Ability to edit own venue listings
- [ ] Premium profile management
- [ ] Basic analytics (view counts)

---

## Phase 4: Advanced Features (Future)

**Goal:** Enhanced user and venue owner experience

### Features to Add
- [ ] User ratings & reviews
- [ ] Singer queue system
- [ ] Event calendar
- [ ] Payment processing (optional premium features)
- [ ] Social features (save favorites, follow venues)
- [ ] Venue analytics dashboard
- [ ] Marketing tools for owners

---

## Phase 5: Monetization & Growth (Future)

**Goal:** Create sustainable revenue streams

### Features to Add
- [ ] Premium subscription plans
- [ ] Merch/store integration
- [ ] Sponsored placements
- [ ] Venue advertising options
- [ ] Singer app (native or PWA)

---

## Current Dependencies
- Next.js 16.2.6 ✅
- React 19.2.4 ✅
- TypeScript 5 ✅
- Tailwind CSS 4 ✅
- ESLint 9 ✅

## Future Dependencies
- Supabase (Phase 2)
- NextAuth.js or alternative auth (Phase 3)
- Payment processing library (Phase 4+)
- Mobile framework (Phase 5)

## Risk & Mitigation
| Risk | Impact | Mitigation |
|------|--------|-----------|
| Mock data complexity | Medium | Start with 12 venues, iterate |
| Form state management | Low | Use React hooks, simple submission handling |
| Mobile responsiveness | Medium | Test on multiple devices, use Tailwind's responsive utilities |
| TypeScript type coverage | Low | Define interfaces upfront, use strict mode |
| Scope creep | High | Enforce Phase 1 boundary strictly, defer Phase 2+ features |

