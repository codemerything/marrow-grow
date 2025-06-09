# Marrow Grow - Project Structure

## Overview
Marrow Grow is a spooky plant cultivation game built with Next.js, TypeScript, and Tailwind CSS. Players grow cryptic plants through different stages while managing resources and defending against threats.

## File Structure

\`\`\`
marrow-grow-game/
├── app/
│   ├── layout.tsx                 # Root layout with font configuration and theme provider
│   ├── globals.css               # Global styles with Tailwind, custom CSS, and pixel art rendering
│   ├── page.tsx                  # Main application entry point with game state management
│   ├── dashboard/
│   │   └── page.tsx              # Dashboard page wrapper (currently unused)
│   └── selection/
│       └── page.tsx              # Selection page wrapper (currently unused)
├── components/
│   ├── auth/
│   │   └── AuthModal.tsx         # Authentication modal with sign-in/sign-up forms
│   ├── game/
│   │   ├── DailySpinModal.tsx    # Daily spin feature for earning extra lives
│   │   ├── DashboardMenu.tsx     # Main dashboard menu with user info and navigation
│   │   ├── FeedingScheduleScreen.tsx # Nutrient feeding configuration for 3 months
│   │   ├── GameDashboard.tsx     # Dashboard screen wrapper component
│   │   ├── GamePlayingScreen.tsx # Playing screen wrapper component
│   │   ├── GameScreen.tsx        # Initial game screen with authentication
│   │   ├── GameSelection.tsx     # Seed, soil, and defense selection screen
│   │   ├── HelpMenu.tsx          # Help menu popup with user actions
│   │   ├── HowToPlayModal.tsx    # Tutorial modal explaining game mechanics
│   │   ├── LeaderboardModal.tsx  # Leaderboard display with top players
│   │   └── MainGameScreen.tsx    # Main gameplay interface with plant visualization
│   ├── layout/
│   │   └── Header.tsx            # Game header with logo
│   ├── theme-provider.tsx        # Dark/light theme provider wrapper
│   ├── ui/
│   │   ├── button.tsx            # Reusable button component (shadcn/ui)
│   │   ├── card.tsx              # Card component for layouts (shadcn/ui)
│   │   ├── dialog.tsx            # Modal dialog component (shadcn/ui)
│   │   ├── dropdown-menu.tsx     # Dropdown menu component (shadcn/ui)
│   │   ├── GameButton.tsx        # Custom game-styled button component
│   │   ├── input.tsx             # Form input component (shadcn/ui)
│   │   ├── label.tsx             # Form label component (shadcn/ui)
│   │   ├── progress.tsx          # Progress bar component (shadcn/ui)
│   │   ├── scroll-area.tsx       # Scrollable area component (shadcn/ui)
│   │   └── tabs.tsx              # Tab navigation component (shadcn/ui)
│   └── user/
│       ├── NotificationsModal.tsx # User notifications display
│       └── UserInfo.tsx          # User information display component
├── hooks/
│   ├── use-mobile.tsx            # Hook for mobile device detection
│   └── use-toast.ts              # Toast notification hook
├── lib/
│   ├── storage.ts                # Storage service for game data (future AppWrite integration)
│   └── utils.ts                  # Utility functions including className merger
├── public/
│   └── images/
│       ├── bg1.png               # Background image for login screen
│       ├── bg2.png               # Background image for dashboard
│       ├── bg3.png               # Background image for game screens
│       ├── flower-pot-animation.gif # Animated plant pot for main game
│       └── mglogo.png            # Marrow Grow logo
├── types/
│   └── game.ts                   # TypeScript type definitions for game entities
├── next.config.mjs               # Next.js configuration
├── package.json                  # Project dependencies and scripts
├── tailwind.config.ts            # Tailwind CSS configuration with custom colors
└── tsconfig.json                 # TypeScript configuration
\`\`\`

## Component Descriptions

### Core Game Flow Components

#### `app/page.tsx`
- **Purpose**: Main application controller managing game state transitions
- **Features**: Handles navigation between login, dashboard, selection, feeding, and playing screens
- **State Management**: Manages user data, game options, and current game state

#### `components/game/GameScreen.tsx`
- **Purpose**: Initial landing screen with authentication
- **Features**: Displays game logo and sign-in button
- **Background**: Uses bg1.png for mystical forest atmosphere

#### `components/game/GameDashboard.tsx`
- **Purpose**: Main hub after user authentication
- **Features**: Daily spin, leaderboard access, how-to-play guide, and play button
- **Background**: Uses bg2.png for workshop environment

#### `components/game/GameSelection.tsx`
- **Purpose**: Pre-game setup for plant cultivation
- **Features**: Seed selection (Marrow Mint, Bone Blossom, Crypt Cookies), soil types, defense options
- **Background**: Uses bg3.png for laboratory setting

#### `components/game/FeedingScheduleScreen.tsx`
- **Purpose**: Nutrient feeding configuration for 3-month growing cycle
- **Features**: 10 different nutrient types with unique properties, scrollable selection, month-by-month planning
- **Nutrients**: Basic Mix, Growth Boost, Potency Plus, Balanced Blend, Fungal Fizz, Bone Broth, Phantom Dew, Rot Juice, Cosmic Compost, Doom Dust

#### `components/game/MainGameScreen.tsx`
- **Purpose**: Core gameplay interface where plant cultivation happens
- **Features**: 
  - Plant visualization with animated flower pot
  - Resource management (Water, Light, Nutrients, Stress)
  - Growth progress tracking
  - Action buttons (Candle Light, Grow Light, Quantum Light)
  - Real-time events system
  - Seed and soil type display

### Authentication & User Management

#### `components/auth/AuthModal.tsx`
- **Purpose**: User authentication interface
- **Features**: Sign-in and sign-up forms with email/password validation
- **Future Integration**: Prepared for AppWrite authentication service

#### `components/user/UserInfo.tsx`
- **Purpose**: User information display and logout functionality
- **Features**: Connection status, email display, notification access

#### `components/user/NotificationsModal.tsx`
- **Purpose**: In-game notification system
- **Features**: Achievement alerts, event notifications, reward announcements

### Game Features & Modals

#### `components/game/DailySpinModal.tsx`
- **Purpose**: Daily reward system for earning extra lives
- **Features**: 25% win chance, bone/weed rewards vs skull penalty, 24-hour cooldown

#### `components/game/LeaderboardModal.tsx`
- **Purpose**: Competitive ranking display
- **Features**: Top player rankings, score tracking, trophy system

#### `components/game/HowToPlayModal.tsx`
- **Purpose**: Interactive tutorial and game guide
- **Features**: Tabbed interface covering basics, resources, and strategy

#### `components/game/HelpMenu.tsx`
- **Purpose**: Quick access menu for common actions
- **Features**: Daily spin access, lives display, help guide, leaderboard

### Utility Components

#### `components/ui/GameButton.tsx`
- **Purpose**: Custom styled button matching game aesthetic
- **Features**: Primary/secondary variants, pixel font styling, hover effects

#### `components/ui/scroll-area.tsx`
- **Purpose**: Custom scrollable areas for content overflow
- **Features**: Horizontal/vertical scrolling, custom scrollbar styling

#### `lib/storage.ts`
- **Purpose**: Data persistence layer
- **Features**: Local storage implementation, prepared for AppWrite database integration
- **Methods**: Player data saving/loading, game state management

#### `types/game.ts`
- **Purpose**: TypeScript type definitions for game entities
- **Includes**: Player, Plant, GameState, SeedBank, HighScores interfaces

## Styling & Assets

### CSS & Styling
- **Global Styles**: Custom pixel art rendering, scrollbar styling, dark theme variables
- **Tailwind Config**: Custom color palette (purple primary, gray backgrounds), pixel font integration
- **Font System**: Inter for UI, Press Start 2P for pixel game text

### Image Assets
- **bg1.png**: Mystical forest background for login screen
- **bg2.png**: Workshop environment for dashboard
- **bg3.png**: Laboratory setting for game screens
- **mglogo.png**: Main game logo with skull and plant design
- **flower-pot-animation.gif**: Animated plant container for main gameplay

## Game Mechanics Overview

### Resource Management
- **Water**: Basic plant hydration needs
- **Light**: Growth rate controller (Candle Light → Grow Light → Quantum Light)
- **Nutrients**: 10 different types affecting potency and yield
- **Stress**: Negative factor reducing plant quality

### Growth Stages
1. **Germinating** (Crypt Sprout)
2. **Bone Growth**
3. **Phantom Bloom**
4. **Harvestable**

### Defense System
- **Grower**: Counters pest attacks
- **Hound**: Defends against raiders
- **Vault**: Protects seed collection

### Events System
- **Random Events**: Droughts, pest attacks, equipment failures
- **Player Actions**: Resource management decisions
- **Consequences**: Affect plant health, potency, and yield

## Future Development

### Planned Integrations
- **AppWrite**: Database and authentication service
- **Real-time Updates**: Live game state synchronization
- **Multiplayer Features**: Trading, competitions, guild systems
- **Advanced Analytics**: Player behavior tracking, game balance optimization

### Expandable Systems
- **More Plant Varieties**: Additional seed types and growth patterns
- **Seasonal Events**: Time-limited challenges and rewards
- **Crafting System**: Tool and equipment creation
- **Market Economy**: Player-to-player trading system
