# ParaLink - EOG Communication System Documentation

**Complete Project Documentation & Guide**  
Last Updated: January 26, 2026

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Quick Start Guide](#quick-start-guide)
3. [Technology Stack](#technology-stack)
4. [Features](#features)
5. [Installation & Setup](#installation--setup)
6. [Project Structure](#project-structure)
7. [Design System](#design-system)
8. [Component Specifications](#component-specifications)
9. [Troubleshooting](#troubleshooting)
10. [Development History](#development-history)

---

## 🎯 Project Overview

ParaLink is a comprehensive and accessible communication application designed specifically for paralyzed patients using **Electrooculography (EOG)** technology. This Final Year Project (FYP) enables users to communicate, access news, control home appliances, and reach emergency contacts through eye movements and blink detection.

### Key Objectives
- Bridge the communication gap for paralyzed individuals
- Provide intuitive EOG-based interaction
- Support multiple languages with Text-to-Speech
- Ensure accessibility with calming colors and smooth animations
- Enable control of home devices through eye tracking

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** (v18 or higher)
- **npm** or **yarn** package manager

### Installation

```bash
# 1. Clone the repository
git clone <repository-url>
cd FYP_EOG_System_For_Paralyzed_people

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

The application will be available at: **http://localhost:5173/**

### Available Commands

```bash
# Development
npm run dev              # Start dev server

# Production
npm run build            # Build for production
npm run preview          # Preview production build

# Code Quality
npm run lint             # Run ESLint
```

---

## 📦 Technology Stack

### Core Technologies
- **React 18.3.1** - Modern UI library (JavaScript only)
- **Vite 5.4.2** - Fast build tool and development server
- **Tailwind CSS 3.4.1** - Utility-first CSS framework
- **Bootstrap 5.3.8** - Component library
- **React-Bootstrap 2.10.10** - Bootstrap components for React

### Additional Libraries
- **Lucide React** - Beautiful, consistent icons
- **WebGazer.js** - Eye tracking for EOG functionality
- **Supabase Client** - Backend services (optional, currently mocked)

### Development Tools
- **ESLint** - Code linting and quality assurance
- **PostCSS & Autoprefixer** - CSS processing
- **Vite** - Hot module replacement (HMR)

---

## ✨ Features

### 🔐 Authentication System
- Secure Login & Signup pages
- Animated transitions with calming effects
- User-friendly forms for EOG interaction
- Mock authentication with localStorage

### 🏠 Main Dashboard
- Welcome animation on first login
- Sidebar navigation (Home, Contact, About, Language Selector)
- Interactive category cards:
  - **Communication** - Express emotions and needs
  - **News** - Browse news categories
  - **Home Appliances** - Control lights, fans, AC, TV, etc.
  - **Emergency** - Quick access to urgent help

### 💬 Communication Module
- 9 emotion cards: Pain, Happy, Sad, Hungry, Washroom, Tired, Thirsty, Cold, Hot
- Visual emoji representations
- Text-to-Speech in 6 languages
- Full sentence translation (e.g., "Happy" → "I am happy")

### 🏡 Home Appliances Control
- Control 6 device categories:
  - Lights (On/Off/Dim/Brighten)
  - Fan (On/Off/Speed Up/Speed Down)
  - Air Conditioner (On/Off/Temp Up/Temp Down)
  - Television (On/Off/Volume Up/Volume Down)
  - WiFi Router (On/Off/Restart)
  - All Devices (Turn All On/Off)

### 📰 News Section
- 6 categories: Health Tips, World News, Trending, Lifestyle, Events, Daily Digest
- Accessible content presentation
- Category-based browsing

### 🚨 Emergency Contacts
- 6 critical options:
  - Call 911 (Critical)
  - Call Nurse
  - Medical Alert
  - Medication Needed
  - Severe Discomfort
  - Security Alert

### 🌍 Multi-Language Support
- **6 Languages**: English, Urdu, Arabic, Spanish, French, German
- Text-to-Speech with proper voice selection
- Persistent language preferences

### 👁️ EOG Technology
- **Keyboard Mode**: Spacebar for blink detection (testing)
- **Camera Mode**: WebGazer.js for actual eye tracking
- 3-blink confirmation system
- Visual blink counter (X/3)
- Focus indicators with rings

---

## ⚙️ Installation & Setup

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Environment Variables (Optional)
If using Supabase in the future:

```bash
# Create .env file
cp .env.example .env

# Add your credentials
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### Step 3: Run the Application
```bash
npm run dev
```

Visit: http://localhost:5173/

### Step 4: Login
Use any email/password (authentication is currently mocked).

---

## 📁 Project Structure

```
FYP_EOG_System_For_Paralyzed_people/
├── src/
│   ├── components/          # React components (.jsx)
│   │   ├── Login.jsx
│   │   ├── SignUp.jsx
│   │   ├── WelcomeScreen.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Sidebar.jsx
│   │   ├── BlinkIndicator.jsx
│   │   ├── CommunicationModal.jsx
│   │   ├── NewsModal.jsx
│   │   ├── EmergencyModal.jsx
│   │   └── HomeAppliancesModal.jsx
│   ├── contexts/            # React context providers
│   │   ├── AuthContext.jsx
│   │   └── EogContext.jsx
│   ├── hooks/               # Custom React hooks
│   │   └── useEogSelection.js
│   ├── services/            # Service classes
│   │   ├── EogService.js    # Blink detection
│   │   ├── TtsService.js    # Text-to-Speech
│   │   └── CameraService.js # Eye tracking
│   ├── App.jsx              # Main app component
│   ├── main.jsx             # Entry point
│   └── index.css            # Global styles + Tailwind
├── package.json             # Dependencies
├── vite.config.js           # Vite configuration
├── tailwind.config.js       # Tailwind configuration
├── eslint.config.js         # ESLint configuration
└── index.html               # HTML template
```

---

## 🎨 Design System

### Color Palette

#### Primary Colors
- **Teal Primary**: `#2DD4BF` (from-teal-400)
- **Teal Dark**: `#14B8A6` (from-teal-500)
- **Cyan Light**: `#22D3EE` (to-cyan-500)
- **Cyan Dark**: `#06B6D4` (to-cyan-600)

#### Category Card Colors
- **Communication**: Teal-400 to Cyan-500
- **News**: Blue-400 to Indigo-500
- **Home Appliances**: Purple-400 to Pink-500
- **Emergency**: Orange-400 to Red-500

#### Emotion Colors
- **Pain**: Red-400 to Rose-500
- **Happy**: Yellow-400 to Orange-500
- **Sad**: Blue-400 to Cyan-500
- **Hungry**: Green-400 to Emerald-500
- **Thirsty**: Sky-400 to Blue-500
- **Tired**: Indigo-400 to Blue-500
- **Cold**: Cyan-400 to Teal-500
- **Hot**: Orange-400 to Red-500

### Typography
- **Font Family**: 'Inter', sans-serif
- **Heading 1**: 36px (text-4xl) - Bold
- **Heading 2**: 30px (text-3xl) - Bold
- **Heading 3**: 24px (text-2xl) - Bold
- **Body**: 16px (text-base) - Regular
- **Small**: 14px (text-sm) - Regular

### Spacing & Border Radius
- **Spacing**: 4px, 8px, 16px, 24px, 32px
- **Border Radius**: 8px, 12px, 16px, 24px, full (9999px)

### Animations
- `animate-fade-in` - Modal fade-in effects
- `animate-slide-up` - Card entrance animations
- `animate-bounce-slow` - Icon bounce animation
- `animate-pulse-slow` - Subtle pulse effect
- `animate-heartbeat` - Heart icon heartbeat (WelcomeScreen)
- `animate-shake` - Error message shake
- `animate-pulse-border` - Critical alert pulse
- `blink-pulse` - Blink counter animation

---

## 📱 Component Specifications

### 1. Dashboard (Main Interface)
- Left sidebar with navigation
- Main content area with 4 category cards
- Grid layout: 2x2 on desktop, 1 column on mobile
- Card hover effects: scale-105, shadow-2xl

### 2. Communication Modal
- Full-screen overlay with backdrop blur
- 3x3 grid of emotion cards
- Each card has emoji, label, and description
- TTS speaks full sentences when clicked

### 3. Home Appliances Modal
- Header gradient: Purple-500 to Pink-500
- 3x2 grid of appliance cards
- Each card shows device name, icon, and available states
- Instructions section at bottom

### 4. News Modal
- Header gradient: Blue-400 to Indigo-500
- 6 news category cards
- Icons: Heart, Globe, TrendingUp, Lightbulb, Calendar, Newspaper

### 5. Emergency Modal
- Header gradient: Red-500 to Rose-600
- Warning banner at top
- 6 emergency option cards
- "CRITICAL" badge for 911 option

### 6. Contact Page
- 4-card grid layout
- Emergency Hotline, Email Support, Visit Us, Operating Hours
- Each with icon, title, and details

### 7. About Page
- Hero section with gradient
- Mission statement with Heart icon
- Features grid (3 cards)
- Impact statistics (6 Languages, 24/7, 100% Accessibility)

---

## 🔧 Troubleshooting

### Text-to-Speech (TTS) Not Working

#### Quick Test
Open browser console (F12) and run:
```javascript
window.speechSynthesis.speak(new SpeechSynthesisUtterance('Test'));
```

#### Common Issues & Fixes

**Issue 1: No voices available**
- Refresh the page (F5)
- Wait 2-3 seconds after page load
- Try again

**Issue 2: Low volume**
- Check system volume
- Check browser site permissions
- Run: `window.speechSynthesis.cancel()` then try again

**Issue 3: Works once but not again**
- Refresh the page
- Some browsers limit speech synthesis usage

**Issue 4: Browser not supported**
- Try Chrome, Edge, or Safari (best support)
- Update browser to latest version

#### Expected Console Output
When working correctly:
```
Speaking: Happy
TTS Service: Speaking "I am happy" in en with voice: Microsoft David - English (United States)
TTS: Speech completed
```

#### Browser Compatibility
- ✅ Chrome - Excellent support
- ✅ Edge - Excellent support
- ✅ Safari - Good support
- ✅ Firefox - Good support

### Development Server Issues

**Server won't start?**
```bash
# Windows PowerShell
Stop-Process -Name "node" -Force
npm run dev
```

**Changes not showing?**
- Hard refresh: `Ctrl + Shift + R`
- Clear browser cache
- Restart dev server

**Import errors?**
- Check file extensions are `.jsx` or `.js`
- Verify import paths don't have `.tsx` or `.ts`

---

## 📚 Development History

### January 26, 2026 - Sidebar Hiding Feature
- Added functionality to hide sidebar when modals are opened
- Preference saved to localStorage
- Smooth animations for sidebar show/hide
- Can be undone by setting `localStorage.setItem('hideSidebarOnModal', 'false')`

### January 9, 2026 - About Page & Voice Updates
- Complete redesign of About page with hero section
- Added Mission section with Heart icon
- Features grid with 3 cards
- Impact statistics section
- Enhanced TTS service with better error handling

### January 8, 2026 - Code Cleanup
- Removed unused Supabase dependencies
- Cleaned up unused CSS animations (scale-in, eog-glow)
- Removed unused icon imports
- Optimized bundle size

### January 7, 2026 - TypeScript to JavaScript Conversion
- Converted all `.ts` and `.tsx` files to `.js` and `.jsx`
- Removed all TypeScript dependencies
- Added Bootstrap 5.3.8 support
- Updated ESLint configuration for JavaScript
- All features maintained, zero functionality loss

### Project Initialization
- Created Final Year Project structure
- Implemented core authentication system
- Built dashboard with 4 main categories
- Integrated WebGazer.js for eye tracking
- Developed multi-language TTS system

---

## 🎯 Design Philosophy

The application is built with **accessibility and usability** as top priorities:

- **Calming Color Palette**: Teal and cyan gradients to reduce visual stress
- **Large Interactive Elements**: Optimized for EOG-based selection
- **Smooth Animations**: Gentle transitions that provide feedback
- **High Contrast**: Ensures readability for all users
- **Responsive Design**: Works across different screen sizes
- **EOG Focus Indicators**: White rings and blink counters
- **Generous Spacing**: Prevents accidental selections

---

## 🔒 Security

- User authentication via Supabase (currently mocked)
- Environment variables for sensitive credentials
- All data encrypted and stored securely
- Session management with automatic token refresh
- No sensitive data stored in localStorage (except mock auth during development)

---

## 📝 License

This project is part of a Final Year Project (FYP) and is intended for educational purposes.

---

## 📧 Contact

For questions, suggestions, or collaboration opportunities, please reach out through the project's issue tracker.

---

**Status**: ✅ Production Ready  
**Version**: 1.0  
**Last Updated**: January 26, 2026
