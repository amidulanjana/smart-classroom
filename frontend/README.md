# SchoolConnect - Smart Classroom App

A React Native mobile application built with Expo that connects schools and homes.

## Features

- **Login Screen**: Beautiful login interface with role selection (Teacher/Parent) test part
- **Dark Mode Support**: Automatic theme switching
- **Clean UI**: Modern design with smooth animations

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo Go app (for testing on physical device)

### Installation

```bash
# Install dependencies
npm install

# Start the development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios
```

## Project Structure

```
app/
  ├── (tabs)/           # Tab navigation screens
  ├── login.tsx         # Login screen component
  └── _layout.tsx       # Root layout
components/
  ├── themed-text.tsx   # Themed text component
  ├── themed-view.tsx   # Themed view component
  └── ui/               # UI components
constants/
  └── theme.ts          # App theme and colors
hooks/                  # Custom React hooks
assets/                 # Images and static files
```

## Theme Colors

The app uses a consistent color scheme defined in `constants/theme.ts`:

- **Primary**: #2463eb (Blue)
- **Background**: #f6f6f8 (Light) / #111621 (Dark)
- **Surface**: #ffffff (Light) / #1f2937 (Dark)
- **Text**: #0e121b (Light) / #ffffff (Dark)

## License

MIT
