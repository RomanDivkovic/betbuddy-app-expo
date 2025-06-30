# BetBuddy Mobile App

A React Native/Expo mobile application that mirrors the functionality of the BetBuddy web app for group betting on MMA events.

## Features

### Authentication
- Email/password sign up and sign in
- User profile management
- Firebase Authentication integration

### Groups
- Create and join betting groups
- View group members and details
- Group chat/posts functionality
- Admin/member role management

### Events & Betting
- View upcoming, live, and completed MMA events
- Make predictions on fight outcomes
- Choose winners and fight finish methods (KO/TKO, Submission, Decision)
- View event details and fight cards

### Social Features
- Create posts within groups
- Like and interact with group content
- Real-time leaderboards
- Member statistics and rankings

### Navigation
- Bottom tab navigation (Home, Groups, Events, Profile)
- Stack navigation for detailed views
- Native navigation patterns for iOS/Android

## Tech Stack

- **React Native/Expo** - Mobile app framework
- **Firebase** - Backend services (Auth, Realtime Database)
- **React Navigation** - Navigation library
- **TypeScript** - Type safety
- **React Hook Form** - Form management
- **Date-fns** - Date manipulation

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Scan the QR code with Expo Go app (Android) or Camera app (iOS)

## Project Structure

```
src/
├── components/          # Reusable components
│   └── AppNavigator.tsx # Main navigation component
├── context/            # React contexts
│   └── AuthContext.tsx # Authentication context
├── lib/               # Configuration files
│   └── firebase.ts    # Firebase configuration
├── screens/           # Screen components
│   ├── AuthScreen.tsx
│   ├── HomeScreen.tsx
│   ├── GroupsScreen.tsx
│   ├── EventsScreen.tsx
│   ├── ProfileScreen.tsx
│   ├── GroupDetailsScreen.tsx
│   └── EventDetailsScreen.tsx
├── services/          # API services
│   └── firebaseService.ts
└── types/            # TypeScript type definitions
    └── index.ts
```

## Key Screens

### Home Screen
- Welcome dashboard
- Quick stats about user's groups
- Recent activity overview
- Quick action buttons

### Groups Screen
- List of user's groups
- Create new group functionality
- Group filtering and search
- Member count and basic info

### Group Details Screen
- Tabbed interface (Posts, Events, Members)
- Create posts within groups
- View group events and members
- Real-time updates

### Events Screen
- Filter events by status (upcoming, live, completed)
- Event cards with key information
- Status indicators and match counts

### Event Details Screen
- Tabbed interface (Matches, Predictions, Leaderboard)
- Make predictions on individual fights
- View user predictions and results
- Real-time leaderboard updates

### Profile Screen
- User information display
- Account management options
- Settings and preferences
- Logout functionality

## Firebase Integration

The app integrates with Firebase for:
- **Authentication**: User sign up, sign in, password reset
- **Realtime Database**: Groups, events, predictions, posts, leaderboards
- **Real-time Updates**: Live data synchronization

## Future Enhancements

- Push notifications for events and group updates
- Image uploads for user profiles and group photos
- Advanced betting statistics and analytics
- Social media integration
- Offline support with sync
- Dark mode theme

## Development Notes

This mobile app is designed to be feature-complete with the web version, providing a native mobile experience for the BetBuddy platform. The architecture follows React Native best practices with proper separation of concerns and type safety throughout.
