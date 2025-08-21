# Better Decision App - Project Structure

## Overview
Better Decision is a React Native application designed to help users make better decisions through various calculators, comparison tools, and randomizers. The app is structured with a clean architecture focusing on modularity and maintainability.

## Directory Structure

```
BetterDecision/
├── src/                     # Source code
│   ├── App.tsx              # Main application component
│   ├── context/             # React context providers
│   │   └── ThemeContext.tsx # Theme management
│   ├── navigation/          # Navigation setup
│   │   └── MainNavigator.tsx # Main tab navigator
│   ├── screens/             # Application screens
│   │   ├── calculators/     # Calculator screens
│   │   │   ├── CalculatorsScreen.tsx  # Main calculators screen
│   │   │   ├── UnitCalculatorScreen.tsx
│   │   │   ├── TotalCostScreen.tsx
│   │   │   └── DayCounterScreen.tsx
│   │   ├── lists/           # List comparison screens
│   │   │   ├── ListsScreen.tsx  # Main lists screen
│   │   │   ├── ProsConsScreen.tsx
│   │   │   ├── QuickComparisonScreen.tsx
│   │   │   └── DetailComparisonScreen.tsx
│   │   ├── fortune/         # Random decision screens
│   │   │   ├── FortuneScreen.tsx  # Main fortune screen
│   │   │   ├── SpinnerScreen.tsx
│   │   │   └── DiceScreen.tsx
│   │   └── settings/        # Settings screens
│   │       └── SettingsScreen.tsx
│   └── utils/               # Utility functions
│       └── storage.ts       # Data persistence utilities
├── index.js                 # Entry point
├── app.json                 # App configuration
├── package.json             # Dependencies
└── tsconfig.json            # TypeScript configuration
```

## Core Features

### 1. Calculators
- **Unit Calculator**: Compare products by unit price
  - Input: Product name, quantity, unit price, unit type
  - Output: Price per standard unit and verdict
- **Total Cost**: Calculate the true cost with additional fees
  - Input: Product name, base price, indirect costs (delivery, tax, etc.)
  - Output: Total cost comparison
- **Day Counter**: Find the number of days between dates
  - Input: Start date, end date
  - Output: Days difference

### 2. Lists
- **Pros & Cons**: Weigh the positives and negatives
  - Input: Positive points, negative points
  - Output: Side-by-side display with weighted scoring
- **Quick Comparison**: Simple yes/no/partial comparison table
  - Input: Criteria, two or more options
  - Output: Table with yes/no/partial indicators
- **Detail Comparison**: Detailed text comparison table
  - Input: Criteria, two or more options
  - Output: Table with text entries

### 3. Fortune
- **Spinner**: "Spin to Decide" with custom segments
  - Input: Custom segments (names, tasks, choices)
  - Output: Random selection
- **Dice**: "Roll the Dice" for random numbers
  - Input: Number of dice, sides per die
  - Output: Random dice results

### 4. Settings
- Appearance/Theme customization (Light/Dark/Custom colors)
- Data Management (Clear cache, manage saved comparisons)
- App Info (Rate App, Privacy Policy, Terms of Service, Contact Us)

## Technical Implementation

### Navigation
The app uses React Navigation with a bottom tab navigator for the main tabs and stack navigators within each tab for screen navigation.

### Theme Management
A ThemeContext provides light and dark themes with the ability to customize colors. Theme preferences are persisted using AsyncStorage.

### Data Persistence
The app uses AsyncStorage to save user data including:
- Saved comparisons
- User preferences
- Theme settings

### UI Components
The UI is built using React Native's core components and enhanced with:
- Vector icons for improved visual appeal
- Custom components for specialized functionality
- Responsive layouts for various device sizes

## Future Enhancements
- Data export/import functionality
- Cloud synchronization
- Sharing capabilities
- Additional calculator and comparison tools
- Enhanced visualization options
