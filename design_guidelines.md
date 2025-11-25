# PriveScreen Design Guidelines

## Design Approach: Healthcare Design System with African Market Optimization

**Selected Approach**: Material Design System adapted for healthcare privacy and African market needs

**Justification**: As a privacy-first healthcare platform handling sensitive sexual health data across patient, diagnostic center, and sponsor portals, PriveScreen requires:
- Established patterns that build immediate trust and familiarity
- Clear information hierarchy for complex consent flows and multi-role workflows
- Mobile-first approach (critical for African markets)
- Accessible, professional medical-grade interface that reduces stigma

**Key Design Principles**:
1. **Privacy by Design**: Visual cues reinforcing security and anonymity at every step
2. **Clarity Over Cleverness**: Complex consent/sharing flows must be instantly understandable
3. **Dignified Minimalism**: Professional medical interface that destigmatizes sexual health
4. **Mobile-Native**: Primary experience optimized for mobile devices
5. **Trust Signals**: Consistent use of security indicators, verification badges, and audit trail visibility

---

## Typography

**Font Stack**: 
- Primary: Inter (via Google Fonts CDN) - exceptional readability, professional, works across all African languages
- Monospace: JetBrains Mono - for codes, transaction IDs, test results

**Type Scale**:
- Hero/Display: text-5xl (48px), font-bold
- Section Headers: text-3xl (30px), font-semibold  
- Card Headers: text-xl (20px), font-semibold
- Body: text-base (16px), font-normal
- Small/Meta: text-sm (14px), font-medium
- Captions: text-xs (12px), font-normal

**Critical Healthcare Typography Rules**:
- Assessment codes: text-2xl, font-mono, tracking-wider, uppercase
- Test results: text-lg, font-medium, tabular-nums
- Consent text: text-base, leading-relaxed (must be highly readable)
- Privacy notices: text-sm, font-medium with subtle emphasis

---

## Layout System

**Spacing Primitives**: Use Tailwind units of **2, 4, 6, 8, 12, 16, 20, 24**
- Tight spacing: p-2, gap-4 (within cards, form fields)
- Standard spacing: p-6, gap-6 (card padding, section spacing)
- Generous spacing: p-8, gap-8, py-12 (between major sections)
- Section separators: py-16, py-20 (landing page sections)

**Container Strategy**:
- Max-width: max-w-7xl for dashboards, max-w-4xl for forms/consent flows
- Mobile: px-4, Tablet: px-6, Desktop: px-8
- All portals use consistent container widths for cross-role familiarity

**Grid Patterns**:
- Dashboard cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- Diagnostic center listings: grid-cols-1 md:grid-cols-2
- Transaction history: Single column with card-based timeline

---

## Component Library

### Navigation
**Patient/Sponsor/Center Dashboards**: Fixed top navigation with role indicator
- Left: Logo + role badge (Patient/Sponsor/Center)
- Center: Primary navigation tabs
- Right: Wallet balance (patients), notification bell, profile dropdown

**Mobile Navigation**: Bottom tab bar (mobile only) with 4-5 core actions per role

### Authentication & Onboarding
- Clean centered forms with max-w-md
- Progressive disclosure for sponsor/center onboarding
- BVN/NIN verification: Step-by-step wizard with progress indicator
- Privacy reassurance messaging throughout

### Wallet & Payments
**Wallet Card**: Prominent card showing balance, recent transactions preview
**Funding Modal**: Sheet/modal with payment method tabs (Card/Mobile Money/USSD)
**Transaction History**: Timeline view with code type badges (Self-Purchased/Sponsored)

### Assessment Codes
**Code Display**: Large card with:
- Generated code: text-4xl, font-mono, tracking-widest, centered
- QR code representation
- Validity status badge
- Copy-to-clipboard action

**Code Input**: Large input field (text-center, text-2xl, font-mono) with real-time validation

### Test Selection & Ordering
**Test Panels**: Cards with:
- Test name (text-xl, font-semibold)
- What's included list (checkmark icons + test names)
- Price badge
- "Select" action button

**Sponsor Code Purchase**: Multi-step flow:
1. Select test type (card selection)
2. Enter recipient details (form with phone/email)
3. Quantity + review
4. Payment confirmation

### Diagnostic Center Portal
**Code Validation**: Prominent search/scan interface
- Large code input field
- Scanner icon/button (mobile camera access)
- Validation result card (success/error states)

**Result Upload**: Structured form matching test standards
- Test parameter fields auto-populated from code
- File upload for supporting documents
- Quality checklist before submission

### Result Viewing & Sharing
**Result Vault**: Card-grid of test results with:
- Test type badge
- Date taken
- Status indicator (New/Viewed/Shared)
- Sponsored badge if applicable

**Result Detail View**: 
- Test metadata header (date, center, test type)
- Results table (parameter, value, reference range, status)
- Download anonymous PDF button
- Share button (opens consent modal)

**Consent Modal**: Critical component
- "Who can see this?" heading
- Recipient selector (dropdown or type phone/email)
- Access duration selector (24hrs/7days/30days/Custom)
- What they'll see preview (summary vs full results)
- Explicit "Grant Access" button
- Revocation notice

**Active Shares List**: Management view showing:
- Who has access
- Expires when
- Revoke button (red, destructive style)

### Diagnostic Center Locator
**Map View**: Full-width map with center markers
**List View**: Cards with:
- Center name + verified badge
- Distance + directions link
- Test types offered (badge list)
- Hours + availability status
- "Get Assessment Code" CTA if not holding one

### Privacy & Audit Trail
**Privacy Dashboard**: Dedicated view showing:
- Who accessed your results (timestamp, consent granted date)
- Sponsor notification log (who was notified of completion)
- Data export requests
- Blockchain verification links (subtle, for advanced users)

---

## Images

**Marketing/Landing Page**:
- **Hero Section**: Large hero image showing diverse African individuals in confident, stigma-free contexts (NOT clinical settings). Image should feel empowering and private. Use subtle overlay with blurred button backgrounds.
- **Trust Section**: Small photos of accredited diagnostic centers, quality badges
- **How It Works**: Illustrative graphics showing the 3-way privacy model (sponsor → code → patient)

**Application Dashboards**: Minimal imagery
- Diagnostic center photos in locator cards
- Empty state illustrations for zero-result screens
- Success confirmations use iconography, not photos

---

## Animations

Use sparingly, only for:
- Loading states during code validation
- Success confirmations (subtle scale + fade)
- Consent grant action (brief highlight to emphasize importance)

**Forbidden**: Flashy transitions, distracting micro-interactions in medical data views