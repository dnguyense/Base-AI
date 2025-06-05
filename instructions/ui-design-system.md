# UI Design System - RetroLens AI

## Tổng Quan UI Architecture

RetroLens AI sử dụng design system hiện đại với aesthetic retro, tối ưu cho trải nghiệm camera và photo editing trực quan.

### Design Principles

- **Minimalist Interface**: Clean, distraction-free camera experience
- **Retro Aesthetic**: Warm colors và vintage typography
- **Gesture-First**: Swipe, pinch, tap interactions cho speed
- **Content-First**: Photo content là center stage

## Main Screens Architecture

### 1. Library/Gallery Screen 📚

**Layout Structure:**

- Grid-based photo display với smart spacing
- Tab navigation: "My Album" / "Recent"
- Search functionality (top-right)
- Floating camera button (bottom-center)

**Key Features Integration:**

- **AI Scene Intelligence**: Auto-categorization trong Recent tab
- **Style Profiles**: Thumbnail previews show applied retro styles
- **Advanced Editor**: Direct edit access từ photo selection

**UI Components:**

```
┌─────────────────────────────────┐
│ ☰ My Library              🔍   │
│                                 │
│ My Album  Recent     ⋯⋯⋯       │
│                                 │
│ ┌───┐ ┌───┐ ┌───┐              │
│ │ 📸│ │ 🌿│ │ 👤│              │
│ └───┘ └───┘ └───┘              │
│ ┌───┐ ┌───┐                    │
│ │ 🌅│ │ 📷│                    │
│ └───┘ └───┘                    │
│                                 │
│ 🏠 📷 ➕ ⚙️ 👤              │
└─────────────────────────────────┘
```

### 2. Camera Interface 📸

**Core Layout:**

- Full-screen viewfinder với minimal overlays
- Mode selector: Night | Photo | Portrait
- Large capture button với context-aware size
- Quick access gallery thumbnail (bottom-left)

**AI Features Integration:**

- **Composition Guide**: Rule of thirds overlay (toggleable)
- **Exposure Assistant**: Smart exposure indicators
- **Scene Intelligence**: Real-time scene detection badge
- **Style Profiles**: Live preview của selected retro style

**UI Elements:**

```
┌─────────────────────────────────┐
│        📷 Scene: Outdoor        │
│                                 │
│    ┌─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┐    │
│    │                       │    │
│    │     VIEWFINDER       │    │
│    │    (Live Preview)     │    │
│    │                       │    │
│    └─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┘    │
│                                 │
│ Night    Photo    Portrait      │
│                                 │
│ 📸    ⚪⚪⚪    📷              │
└─────────────────────────────────┘
```

### 3. Photo Editor Interface 🎨

**Editor Layout:**

- Full-screen photo preview
- Bottom toolbar với category tabs
- Horizontal scroll filters/tools
- Non-destructive editing pipeline

**Advanced Editor Features:**

- **Style Profiles**: Decade-specific filter carousel
- **Exposure Assistant**: Histogram và exposure tools
- **Composition Guide**: Crop guides và rotation tools

**UI Structure:**

```
┌─────────────────────────────────┐
│                           Done  │
│                                 │
│    ┌─────────────────────┐      │
│    │                     │      │
│    │   PHOTO PREVIEW     │      │
│    │                     │      │
│    └─────────────────────┘      │
│                                 │
│ Filter                          │
│ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ │
│ │60s│ │70s│ │80s│ │90s│ │Y2K│ │
│ └───┘ └───┘ └───┘ └───┘ └───┘ │
│                                 │
│ 📐 🌟 📊 🔄 ↩️              │
└─────────────────────────────────┘
```

## UI Component System

### 1. Camera Controls

**Capture Button:**

- Large, responsive với haptic feedback
- Color adaptation based on selected style
- Progress indicator cho burst mode
- **Perfect Shot**: Pulsing animation khi AI detects optimal moment

**Mode Selector:**

- Horizontal scroll với current mode highlight
- Icons + text labels cho clarity
- Smooth transitions between modes

### 2. Filter System UI

**Style Profile Carousel:**

- Horizontal scrollable với preview thumbnails
- Real-time preview application
- Category grouping: 60s, 70s, 80s, 90s, Y2K
- Premium badges cho locked styles

**Filter Intensity Controls:**

- Slider với visual feedback
- Before/after toggle
- Preset intensity levels

### 3. AI Assistance UI

**Scene Intelligence Indicators:**

- Floating badge với detected scene type
- Color-coded confidence levels
- Suggested style recommendations

**Composition Guides:**

- Overlay grid lines (rule of thirds, golden ratio)
- Dynamic composition scoring
- Visual hints cho better framing

**Exposure Assistant:**

- Histogram overlay (toggleable)
- Exposure compensation slider
- HDR mode indicator

## Navigation & Information Architecture

### 1. Tab Navigation System

```
┌─────────────────────────────────┐
│ 🏠 Home | 📷 Camera | ⚙️ Settings │
└─────────────────────────────────┘
```

### 2. Gesture Controls

**Camera Screen:**

- Swipe up/down: Style profile switching
- Pinch: Zoom control
- Tap to focus: Exposure point setting
- Long press: Burst mode activation

**Editor Screen:**

- Swipe left/right: Filter navigation
- Pinch: Zoom and pan
- Two-finger rotate: Image rotation
- Double tap: Fit to screen

### 3. Modal & Overlay System

**Settings Overlay:**

- Slide-up panel với organized sections
- Toggle switches cho AI features
- Slider controls cho sensitivity settings

**Share Sheet Integration:**

- **Social Sharing**: Native platform integration
- Optimized export settings per platform
- Hashtag suggestions based on scene/style

## Visual Design Language

### 1. Color Palette

**Primary Colors:**

- Retro Blue: `#4A90E2` (accent actions)
- Warm White: `#F8F8F8` (backgrounds)
- Charcoal: `#2C2C2C` (text/icons)

**Style-Specific Accents:**

- 60s: Warm Orange `#FF8C42`
- 70s: Earth Brown `#8B4513`
- 80s: Neon Pink `#FF1493`
- 90s: Forest Green `#228B22`
- Y2K: Electric Purple `#9932CC`

### 2. Typography

**Primary Font:** San Francisco (iOS native)
**Secondary:** Custom retro font cho style labels
**Sizing:** 14pt body, 18pt headers, 12pt captions

### 3. Iconography

**Style:** Rounded, minimal icons
**Size:** 24x24pt standard, 32x32pt cho primary actions
**Custom Icons:** Camera modes, AI features, vintage styles

## Responsive Design

### 1. Screen Adaptations

**iPhone Standard:** 375pt width baseline
**iPhone Plus/Max:** Extended layout với side panels
**iPad:** Split-screen editing với library sidebar

### 2. Orientation Support

**Portrait:** Default camera và editing mode
**Landscape:** Optimized cho video recording và advanced editing

## Animation & Transitions

### 1. Camera Transitions

- Smooth mode switching với crossfade
- Style preview transitions với subtle morphing
- Focus animation với gentle pulsing

### 2. Editor Interactions

- Filter application với real-time preview
- Gesture-driven transforms với momentum
- Save/export với progress indication

### 3. AI Feedback Animations

- Scene detection với gentle slide-in
- Composition scoring với color transitions
- Perfect Shot timing với attention-grabbing pulse

## Accessibility Features

### 1. VoiceOver Support

- Descriptive labels cho all controls
- Scene description announcements
- Filter effect descriptions

### 2. Motor Accessibility

- Large touch targets (44pt minimum)
- Alternative controls cho gesture-impaired users
- Voice control integration

### 3. Visual Accessibility

- High contrast mode support
- Dynamic type scaling
- Color blindness considerations

## Performance Optimizations

### 1. Smooth 60fps UI

- Metal rendering cho real-time filters
- Background processing cho AI features
- Optimized image loading và caching

### 2. Memory Management

- Lazy loading cho filter previews
- Efficient image processing pipelines
- Smart caching strategies

## Integration Points

### Camera2 API Integration

- Seamless hardware control overlay
- Real-time parameter adjustment UI
- Preview stream optimization

### ML Kit UI Integration

- Non-blocking AI processing indicators
- Graceful fallback cho unsupported features
- Privacy-focused permission flows

### Social Platform Integration

- Native sharing sheet enhancement
- Platform-specific optimization previews
- Engagement analytics display

---

_File này mô tả comprehensive UI system cho RetroLens AI, integrating tất cả AI features đã thiết kế với modern, intuitive interface design._
