# MyNaksha - Astrology Consultation App

A modern React Native application for astrology consultations featuring AI and human astrologer interactions, built with React Native 0.76 and TypeScript.

## 🎥 Demo

Watch the app in action: [**View Demo Video**](https://drive.google.com/file/d/12Fe8UOKJdhIXs5cV_0bJAAeZbPhuvaS2/view?usp=sharing)

## 📱 Features

- **Welcome Screen**: Introduction to the astrology consultation service
- **Real-time Chat**: Interactive chat interface with system messages
- **Dual Astrologer Support**: 
  - 🤖 AI Astrologer (Green bubbles)
  - 👤 Human Astrologer (Orange bubbles)
- **Feedback System**: 
  - Like/Dislike toggle for AI astrologer messages
  - Expandable feedback chips (Inaccurate, Too Vague, Too Long)
  - Emoji reactions for other messages
- **Message Features**:
  - Reply to messages (swipe-right gesture)
  - Long-press emoji reactions
  - Color-coded sender bubbles
  - Event/system messages
- **Chat Management**:
  - End chat with confirmation modal
  - 5-star rating system
  - Session tracking

## 🏗️ Architecture & Component Structure

The app follows a modular component-based architecture:

### **Screens** (`src/screens/`)
- **`WelcomeScreen.tsx`**: Landing page with app introduction and "Start Chat" button
- **`ChatScreen.tsx`**: Main chat interface handling message flow, state management, and modals
  - Manages message state and interactions
  - Handles like/dislike feedback logic
  - Controls chat initiation and termination
  - Implements rating modal

### **Components** (`src/components/`)
- **`MessageBubble.tsx`**: Reusable message component with:
  - Gesture handlers for swipe-to-reply
  - Animated feedback UI
  - Conditional rendering based on message type and sender
  - Like/Dislike toggle with animated feedback chips
  - Emoji reaction picker

- **`SearchBar.tsx`**: Search input component (legacy, not used in current flow)
- **`ChatRow.tsx`**: Chat list item component (legacy, not used in current flow)

### **Navigation** (`src/navigation/`)
- **`types.ts`**: TypeScript definitions for navigation routes and params

### **Data** (`src/data/`)
- **`chatsData.ts`**: Mock data structure (legacy)
- **`INITIAL_MESSAGES`**: Predefined conversation in ChatScreen

## 🎨 React Native Reanimated Usage

### **1. Animated Feedback Chips**
Located in `MessageBubble.tsx`:
```typescript
const feedbackHeight = useSharedValue(0);

const feedbackChipsStyle = useAnimatedStyle(() => ({
  maxHeight: feedbackHeight.value * 80,
  opacity: feedbackHeight.value,
}));

// Expand on dislike
feedbackHeight.value = withSpring(1);

// Collapse after selection
feedbackHeight.value = withSpring(0);
```
- Uses `withSpring` for smooth expand/collapse animation
- Animates both height and opacity simultaneously

### **2. Swipe-to-Reply Gesture**
Located in `MessageBubble.tsx`:
```typescript
const translateX = useSharedValue(0);

const panGesture = Gesture.Pan()
  .activeOffsetX(10)
  .onUpdate((event) => {
    'worklet';
    if (event.translationX > 0) {
      translateX.value = Math.min(event.translationX, SWIPE_THRESHOLD);
    }
  })
  .onEnd((event) => {
    'worklet';
    if (event.translationX > SWIPE_THRESHOLD) {
      runOnJS(handleReply)();
    }
    translateX.value = withSpring(0);
  });
```
- Implements swipe gesture with threshold detection
- Uses `runOnJS` to trigger React state updates from UI thread
- Spring animation returns bubble to original position

### **3. Rating Modal Animations**
Located in `ChatScreen.tsx`:
```typescript
const fadeAnim = useState(new Animated.Value(0))[0];
const scaleAnim = useState(new Animated.Value(0.8))[0];

Animated.parallel([
  Animated.timing(fadeAnim, {
    toValue: 1,
    duration: 300,
    useNativeDriver: true,
  }),
  Animated.spring(scaleAnim, {
    toValue: 1,
    friction: 8,
    useNativeDriver: true,
  }),
]).start();
```
- Combines fade and scale animations
- Uses native driver for 60fps performance

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or Yarn
- Xcode (for iOS development)
- Android Studio (for Android development)
- CocoaPods (for iOS)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Anurag-Srivastav/MyNaksha.git
cd MyNaksha
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
```

3. **Install iOS dependencies**
```bash
cd ios
pod install
cd ..
```

### Running the App

#### iOS
```bash
npm run ios
# or
yarn ios
```

#### Android
```bash
npm run android
# or
yarn android
```

### Development

Start the Metro bundler:
```bash
npm start
# or
yarn start
```

## 📦 Key Dependencies

- **React Native**: 0.76.6
- **React Navigation**: 
  - @react-navigation/native: ^7.1.26
  - @react-navigation/native-stack: ^7.9.0
- **Gesture & Animation**:
  - react-native-reanimated: ^3.19.5
  - react-native-gesture-handler: ^2.30.0
- **React Native Screens**: ^4.19.0
- **Safe Area Context**: ^5.5.2
- **TypeScript**: ^5.8.3

## 🛠️ Configuration

### Babel Configuration
The app uses React Native Reanimated which requires the Reanimated Babel plugin to be listed **last**:

```javascript
// babel.config.js
module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: ['react-native-reanimated/plugin'], // Must be last
};
```

### Native Setup

#### iOS (`ios/MyNaksha/AppDelegate.swift`)
- Swift-based AppDelegate
- Gesture handler integration

#### Android (`android/app/src/main/java/com/mynaksha/MainActivity.kt`)
```kotlin
override fun onCreate(savedInstanceState: Bundle?) {
  super.onCreate(null) // Required for react-native-screens
}
```

## 📱 App Flow

1. **App Launch** → Welcome Screen
2. **Start Consultation** → Chat Screen (empty state)
3. **Initiate Chat** → Loads predefined conversation
4. **User Interaction**:
   - Send messages
   - React to messages (emoji or like/dislike)
   - Reply to specific messages (swipe gesture)
5. **End Chat** → Confirmation modal → Rating modal → Navigate back

## 🎯 Message Types

- **`system`**: Event messages (centered, gray)
- **`user`**: User messages (blue, right-aligned)
- **`ai_astrologer`**: AI responses (green, left-aligned) with like/dislike
- **`human_astrologer`**: Human astrologer (orange, left-aligned)

## 🔄 State Management

- Local state management using React hooks
- No external state management library
- Message state includes:
  - `liked` (boolean | undefined): Feedback state
  - `feedbackType`: Emoji or feedback indicator
  - `feedbackReason`: Specific dislike reason
  - `replyTo`: Reference to replied message ID

## 📝 Code Style

- TypeScript for type safety
- Functional components with hooks
- StyleSheet for styling (no external styling libraries)
- Modular component structure
- Clear separation of concerns

## 🔧 Troubleshooting

### Metro Cache Issues
```bash
npm start -- --reset-cache
```

### Pod Install Issues (iOS)
```bash
cd ios
pod deintegrate
pod install
cd ..
```

### Android Build Issues
```bash
cd android
./gradlew clean
cd ..
```

## 📄 License

This project is part of a personal portfolio.

## 👤 Author

Anurag Srivastav
- GitHub: [@Anurag-Srivastav](https://github.com/Anurag-Srivastav)
