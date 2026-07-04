---
name: Clinical Excellence Dark
colors:
  surface: '#0f1513'
  surface-dim: '#0f1513'
  surface-bright: '#343a38'
  surface-container-lowest: '#090f0e'
  surface-container-low: '#171d1b'
  surface-container: '#1b211f'
  surface-container-high: '#252b29'
  surface-container-highest: '#303634'
  on-surface: '#dee4e0'
  on-surface-variant: '#bccac4'
  inverse-surface: '#dee4e0'
  inverse-on-surface: '#2b3230'
  outline: '#86948f'
  outline-variant: '#3d4946'
  surface-tint: '#5cdbc2'
  primary: '#5cdbc2'
  on-primary: '#00382f'
  primary-container: '#0fa891'
  on-primary-container: '#00352c'
  inverse-primary: '#006b5b'
  secondary: '#bdc9c3'
  on-secondary: '#28332e'
  secondary-container: '#404c47'
  on-secondary-container: '#afbbb5'
  tertiary: '#ffb4a1'
  on-tertiary: '#5d1805'
  tertiary-container: '#df795e'
  on-tertiary-container: '#5a1503'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#7bf8dd'
  primary-fixed-dim: '#5cdbc2'
  on-primary-fixed: '#00201a'
  on-primary-fixed-variant: '#005144'
  secondary-fixed: '#d9e5de'
  secondary-fixed-dim: '#bdc9c3'
  on-secondary-fixed: '#131e1a'
  on-secondary-fixed-variant: '#3e4944'
  tertiary-fixed: '#ffdbd2'
  tertiary-fixed-dim: '#ffb4a1'
  on-tertiary-fixed: '#3c0800'
  on-tertiary-fixed-variant: '#7c2d18'
  background: '#0f1513'
  on-background: '#dee4e0'
  surface-variant: '#303634'
typography:
  headline-xl:
    fontFamily: Manrope
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.05em
  headline-lg-mobile:
    fontFamily: Manrope
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-padding-mobile: 16px
  container-padding-desktop: 32px
  gutter: 24px
  stack-gap-sm: 8px
  stack-gap-md: 16px
  stack-gap-lg: 32px
---

## Brand & Style
The design system emphasizes high-precision healthcare and professional trust through a sophisticated dark-mode interface. The aesthetic is **Modern Corporate with Tonal Layering**, utilizing a deep, bio-medical color palette to reduce eye strain for clinicians in low-light environments. 

The emotional response is one of calm authority and technical proficiency. By shifting from a light-base to a deep charcoal foundation, the system highlights critical data through luminosity rather than shadow, ensuring that medical insights remain the focal point of the user experience.

## Colors
This dark mode palette is engineered for clinical legibility and depth. 

- **Primary Emerald (#0FA891):** Used for primary actions, branding, and success states. It provides high-contrast signaling against the charcoal base.
- **Deep Charcoal Base (#0B120F):** The foundational layer, providing a non-reflective surface that eliminates glare.
- **Surface Tiers:** Layering is achieved through increasing brightness (from `#16211D` to `#24352F`) rather than elevation shadows, creating a structured hierarchy of information.
- **Typography Colors:** Off-white text (`#E6E9E7`) ensures peak readability, while muted sage-gray (`#8B9791`) is used for metadata and secondary information to maintain visual order.

## Typography
The system uses a tri-font strategy to balance modernity, utility, and technical precision.

- **Manrope (Headlines):** Provides a balanced, professional tone for navigation and page titles.
- **Inter (Body):** Selected for its systematic clarity and excellent legibility in high-density data environments.
- **JetBrains Mono (Labels/Data):** Used for technical values, clinical codes, and timestamps to emphasize accuracy and a "data-first" approach.

For mobile devices, headline sizes are scaled down to maintain information density without overwhelming the viewport.

## Layout & Spacing
The layout follows a **Fluid Grid** model based on an 8px base unit. 

- **Desktop:** 12-column grid with 24px gutters. Use 32px outer margins.
- **Tablet:** 8-column grid with 20px gutters.
- **Mobile:** 4-column grid with 16px gutters and 16px side margins.

Spacing between related clinical elements (e.g., a lab result and its label) should use `stack-gap-sm`, while separation between different diagnostic cards should use `stack-gap-lg`.

## Elevation & Depth
Depth in this dark mode environment is communicated through **Tonal Layers** rather than traditional shadows. 

1. **Level 0 (Base):** `#0B120F` - The primary canvas.
2. **Level 1 (Cards/Containers):** `#16211D` - Default background for grouped information.
3. **Level 2 (Active/High Attention):** `#1C2B25` - For hovering or elevated status.
4. **Outlines:** Use a subtle `#24352F` border for all containers. This ensures structural integrity without adding visual noise. Shadows are reserved for temporary overlays (modals/tooltips) and should be pure black with 40% opacity and a 16px blur.

## Shapes
The shape language is **Rounded (Level 2)**, creating a professional yet approachable feel that avoids the "aggressive" sharpness of traditional enterprise software.

- **Standard Elements:** 0.5rem (8px) radius (e.g., Input fields, small buttons).
- **Large Elements:** 1rem (16px) radius (e.g., Cards, Modals).
- **Extra Large Elements:** 1.5rem (24px) radius (e.g., Featured promotional banners).

## Components

- **Buttons:** Primary buttons use the Clinical Emerald (`#0FA891`) with black text for maximum contrast. Secondary buttons are outlined with `#24352F` and use Primary Text.
- **Input Fields:** Background set to `surface-container-low` (`#1C2B25`) with a subtle `#24352F` border. Active states utilize an Emerald focus ring.
- **Cards:** Use `surface-container` (`#16211D`) as the background. Headers within cards should be separated by a 1px border of `#24352F`.
- **Chips:** Small, high-radius (pill) shapes using `surface-container-high` for inactive states and a low-opacity Emerald tint for active states.
- **Lists:** Rows should have a subtle hover state change to `surface-container-low` to provide immediate feedback in data-heavy views.
- **Checkboxes/Radios:** When checked, they use the Emerald fill. When unchecked, they maintain the `#24352F` border.