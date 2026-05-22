---
name: Ink & Cinnabar Production
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#393939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#20201f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353535'
  on-surface: '#e5e2e1'
  on-surface-variant: '#e2beba'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#aa8986'
  outline-variant: '#5a403e'
  surface-tint: '#ffb4ac'
  primary: '#ffb4ac'
  on-primary: '#690007'
  primary-container: '#b22222'
  on-primary-container: '#ffc8c2'
  inverse-primary: '#b52424'
  secondary: '#e9c349'
  on-secondary: '#3c2f00'
  secondary-container: '#af8d11'
  on-secondary-container: '#342800'
  tertiary: '#82db6f'
  on-tertiary: '#003a00'
  tertiary-container: '#0e6b08'
  on-tertiary-container: '#90ea7b'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdad6'
  primary-fixed-dim: '#ffb4ac'
  on-primary-fixed: '#410003'
  on-primary-fixed-variant: '#92030f'
  secondary-fixed: '#ffe088'
  secondary-fixed-dim: '#e9c349'
  on-secondary-fixed: '#241a00'
  on-secondary-fixed-variant: '#574500'
  tertiary-fixed: '#9df888'
  tertiary-fixed-dim: '#82db6f'
  on-tertiary-fixed: '#002200'
  on-tertiary-fixed-variant: '#005300'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353535'
typography:
  display-lg:
    fontFamily: Hanken Grotesk
    fontSize: 36px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: '1.4'
  body-base:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '400'
    lineHeight: '1.5'
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: '1'
    letterSpacing: 0.05em
  data-numeric:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  container-padding: 24px
  gutter: 16px
  card-gap: 12px
  section-margin: 32px
---

## Brand & Style

The design system is a sophisticated fusion of traditional Chinese aestheticism and high-performance AI technology. It targets creative directors and AI production specialists, evoking a sense of heritage, precision, and immense computational power.

The visual style is **Corporate / Modern** with a **Tactile** undercurrent. It utilizes a deep, layered dark mode that mimics the depth of liquid ink (Shui-mo). The interface avoids the sterility of standard SaaS dashboards by integrating organic textures, subtle gradients that mimic gold leaf, and high-density information layouts that command authority. The emotional response is one of "Professional Prestige"—a workspace where ancient storytelling meets future-tech.

## Colors

The palette is rooted in the traditional "Five Colors" of Chinese art, optimized for a high-contrast dark interface.

*   **Ink Black (#1A1A1A / #121212):** The foundation. Use varying depths of black to create hierarchy. Backgrounds should use a subtle grain or "ink-wash" noise texture (2-3% opacity) to prevent "dead" pixels.
*   **Cinnabar Red (#B22222):** Reserved exclusively for primary actions, critical status updates, and brand signifiers. It represents vitality and the "official seal" of the studio.
*   **Muted Gold (#D4AF37):** Used for financial data, premium metadata, and decorative accents (like thin top-borders on active cards). It conveys value and archival quality.
*   **Dark Jade (#006400):** A sophisticated success state. It is less neon than standard UI greens, feeling more organic and grounded.
*   **Border Accents:** Use low-opacity gold or red for active states, keeping inactive borders in the neutral gray-scale.

## Typography

The typography system prioritizes legibility for both English and Hanzi (Chinese characters). 

**Hanken Grotesk** provides a sharp, contemporary edge for headlines. **Plus Jakarta Sans** is used for body copy due to its wide apertures and friendly yet professional demeanor, which ensures high legibility at the 13px-14px range required for high-density dashboards. **JetBrains Mono** is utilized for metadata, timestamps, and cost figures to emphasize the "AI Engine" and technical nature of the studio.

For Chinese text, fallback to *Source Han Sans* or *PingFang SC* to maintain the clean, sans-serif aesthetic. Maintain tighter tracking for headings and increased leading for body text to handle complex character strokes.

## Layout & Spacing

The design system employs a **Fixed Grid** philosophy for the main dashboard content to ensure technical precision. 

*   **Grid Model:** A 12-column layout with 16px gutters. In the side-panel configuration, the main content area occupies a flexible container that maintains a max-width of 1600px.
*   **Density:** High-density layout. Use 4px increments for internal component spacing and 12px-16px for external component margins. 
*   **Breakpoints:** 
    *   **Desktop (1440px+):** Full sidebar (240px), 3-column card grid.
    *   **Tablet (1024px):** Collapsed sidebar (64px), 2-column card grid.
    *   **Mobile (375px):** Single column, bottom navigation or drawer menu.
*   **Vertical Rhythm:** Use tight vertical spacing for data rows (32px height for small rows, 48px for standard items) to maximize "above-the-fold" information density.

## Elevation & Depth

Hierarchy is established through **Tonal Layers** rather than heavy shadows.

*   **Background:** Deep Ink (#121212).
*   **Surface 1 (Cards/Panels):** Soft charcoal (#1E1E1E) with a 1px solid border (#2C2C2C).
*   **Surface 2 (Hover/Active):** Slightly lighter (#252525) with a subtle "Gold Leaf" top border (2px, #D4AF37) for active selections.
*   **Shadows:** When necessary, use extremely diffused "Ambient Shadows" with a slight black-ink tint (0, 4px, 20px, rgba(0,0,0,0.5)). 
*   **Backdrop:** Modal overlays should use a 60% opacity Ink Black with a 10px blur to maintain the "wash" effect.

## Shapes

The shape language is **Soft**. To maintain the professional and "engineered" feel of a studio dashboard, large rounded corners are avoided. 

*   **Standard Components:** 4px (0.25rem) radius for buttons, input fields, and small chips.
*   **Containers:** 8px (0.5rem) radius for project cards and main panels.
*   **Decorative Elements:** Use perfectly square edges for vertical "status indicators" on the left side of cards to mimic traditional bookbinding or scrolls.

## Components

*   **Buttons:**
    *   *Primary:* Solid Cinnabar Red (#B22222) with white text. No gradient.
    *   *Secondary:* Ghost style with Muted Gold (#D4AF37) border and text.
    *   *Action:* Square-ish (4px radius) to maintain the "stamp" aesthetic.
*   **Project Cards:** Use a vertical hierarchy: Image thumbnail (top), Title/Metadata (middle), Status/Cost footer (bottom). Include a 2px top-border that lights up in Gold or Red when active.
*   **Chips/Tags:** Small, high-contrast labels. Use Dark Jade for "Complete," Muted Gold for "In Progress," and a soft Grey for "Draft."
*   **Input Fields:** Dark background (#121212) with a 1px border (#2C2C2C). Focus state transitions the border to Muted Gold.
*   **Side Navigation:** High-contrast icons. Use a "Red Brushstroke" indicator (vertical line) to mark the active route. 
*   **Progress Bars:** Use a "Liquid Gold" fill effect—a subtle horizontal gradient within the gold spectrum to represent AI generation progress.