# SingHUB Product Specification

## Vision
SingHUB is the definitive karaoke discovery platform for singers looking for their next night out. We answer the primary question: **"Where can I sing karaoke tonight?"**

## Phase 1: MVP - Karaoke Venue Finder (San Diego)

### Target Users
- **Singers:** Looking for karaoke venues with specific features
- **Venue Owners:** Want to list their karaoke venues and attract singers
- **Casual Browsers:** Discovering new karaoke venues in San Diego

### Core Features

#### 1. Homepage
- **Purpose:** Introduce SingHUB and guide users to find venues
- **Key Elements:**
  - Compelling headline: "Where can I sing karaoke tonight?"
  - Search bar (or call-to-action to Find Karaoke page)
  - 3-4 featured venues carousel
  - Basic info about the platform
  - Call-to-action: "Add Your Venue"
  - Link to SingHUB Scout explanation

#### 2. Find Karaoke Page
- **Purpose:** Browse and search karaoke venues in San Diego
- **Key Features:**
  - List of all venues with:
    - Name, address, image/photo
    - Rating/star count
    - Quick tags (e.g., "Live Band", "Private Rooms", "Food & Drink")
  - Search/filter by:
    - Venue name
    - Neighborhood/area
    - Amenities (optional for Phase 1)
  - Grid or list view toggle
  - Click through to venue detail page
  - Link to "Submit Listing" page

#### 3. Venue Detail Page
- **Purpose:** Show comprehensive information about a single venue
- **Key Information (Basic Profile):**
  - Venue name, logo, photos (3-5 images)
  - Full address and map location (static map or link)
  - Hours of operation (with karaoke time windows)
  - Phone number and website link
  - Description/bio
  - Amenities checklist:
    - Live band
    - Private rooms
    - Food service
    - Drink specials
    - Wheelchair accessible
  - Song list info (curated/rotated/request-based)
  - Typical crowd size/vibe
  - Price/cover charge (if any)
  - Review count and average rating
- **Actions:**
  - "Call Now" button
  - "Visit Website" button
  - "Claim This Listing" button (if not owner-verified)
  - "Report Issue" link
  - Share venue link

#### 4. Basic Venue Profile
- **Definition:** Default profile created when a venue is listed
- **Data Points:**
  - Name, address, phone, website
  - Hours and karaoke availability
  - Basic description
  - Photo upload (up to 3 images)
  - Amenities selection (checkbox list)
- **Created By:** SingHUB team or submitted via form
- **Verification:** Manual review before public listing

#### 5. Premium Venue Profile Creation
- **Purpose:** Enhanced profiles for venue owners who want more visibility
- **Additional Fields Over Basic:**
  - Logo/branding
  - Up to 15 photos (gallery)
  - Detailed description (500+ characters)
  - Social media links (Instagram, Facebook)
  - Upcoming events calendar
  - Special promotions/happy hour info
  - Song database details
  - Video snippet (optional)
- **Access:** Form at `/premium-profile`
- **Note:** Stored as form submission, no payment gate yet

#### 6. Claim Listing Page
- **Purpose:** Venue owners claim their venue profile for updates
- **Form Fields:**
  - Venue name
  - Venue phone number (for verification)
  - Owner name
  - Owner email
  - Current description (optional validation against existing)
- **Note:** No authentication required in Phase 1
- **Outcome:** Creates a support ticket for manual verification

#### 7. Submit Listing Page
- **Purpose:** Users submit new venues not yet on SingHUB
- **Form Fields:**
  - Venue name (required)
  - Address/location (required)
  - Phone number (optional)
  - Website (optional)
  - Short description
  - Karaoke availability (hours/days)
  - Basic amenities checkboxes
  - Contact email
  - Photo upload (up to 3)
- **Outcome:** Creates a moderation ticket for SingHUB team review

#### 8. SingHUB Scout Page
- **Purpose:** Educate about how SingHUB discovers venues
- **Content:**
  - What is SingHUB Scout program?
  - How venues get discovered
  - Benefits of being featured
  - Call-to-action: "Submit a venue you love"
  - FAQ about the program

### Venue Data Model (Phase 1)

```typescript
interface VenueBasic {
  id: string;
  name: string;
  address: string;
  city: "San Diego";
  zipCode: string;
  phone: string;
  website?: string;
  description: string;
  
  // Karaoke Details
  karaokeHours: {
    dayOfWeek: string; // "Monday", "Tuesday", etc.
    startTime: string; // "8:00 PM"
    endTime: string;   // "2:00 AM"
  }[];
  songListType: "Curated" | "Request-Based" | "Rotated";
  
  // Amenities
  amenities: {
    liveBand: boolean;
    privateRooms: boolean;
    foodService: boolean;
    drinkSpecials: boolean;
    wheelchairAccessible: boolean;
  };
  
  // Media
  photos: string[]; // URLs to images
  logo?: string;
  
  // Social
  instagram?: string;
  facebook?: string;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  profileType: "Basic" | "Premium";
  verified: boolean;
}
```

### Mock Data Scope (Phase 1)
- **Minimum:** 8-12 San Diego venues
- **Maximum:** 20-30 venues for rich demo
- **Data Source:** Research + realistic San Diego karaoke scene
- **Storage:** TypeScript constant file (`src/data/venues.ts`)

### What's NOT in Phase 1
- User accounts/authentication
- Venue owner dashboards
- Payment processing
- Singer queue/waiting list
- Advanced analytics
- Social features (ratings/reviews from users)
- Merch/store functionality
- Native mobile app
- Supabase integration
- Email confirmations
- SMS notifications

### Success Metrics
- All 8 pages render without errors
- Mock data displays correctly
- Navigation works between pages
- Responsive design on mobile/tablet/desktop
- Form submissions captured (logged, not persisted)
- All links functional

