# Moviedex 🎬

A modern Angular application for discovering movies, managing personal collections, and rating films using The Movie Database (TMDB) API.

## Features

- 🔍 **Movie Search**: Search for movies using TMDB API with pagination support
- 📚 **Collections Management**: Create and manage custom movie collections
- ⭐ **Movie Rating**: Rate movies using TMDB guest sessions
- 📱 **Responsive Design**: Modern UI built with Angular Material and Tailwind CSS
- 💾 **Local Storage**: Collections persist locally in the browser
- 🎯 **Movie Details**: View comprehensive movie information including ratings, stats, and descriptions

## Technologies Used

### Core Framework
- **Angular 21** - Modern Angular framework with standalone components
- **TypeScript 5.9** - Type-safe JavaScript
- **RxJS 7.8** - Reactive programming for async operations

### UI & Styling
- **Angular Material 21** - Material Design components
- **Tailwind CSS 4.1** - Utility-first CSS framework
- **Angular CDK** - Component Dev Kit for custom components

### State Management
- **Angular Signals** - Reactive state management (collections, search state)
- **Computed Signals** - Derived state calculations

### API Integration
- **TMDB API** - The Movie Database API for movie data
- **HttpClient** - Angular HTTP client with retry logic and error handling

### Testing
- **Vitest 4.0** - Fast unit testing framework
- **Angular Testing Utilities** - Component and service testing

### Code Quality
- **ESLint** - Linting with Angular-specific rules
- **Prettier** - Code formatting
- **TypeScript ESLint** - TypeScript-specific linting rules

### Build Tools
- **Angular CLI 21** - Development and build tooling
- **PostCSS** - CSS processing

## Project Structure

```
src/app/
├── core/                          # Core functionality (singleton services)
│   ├── api/
│   │   └── tmdb.service.ts        # TMDB API integration
│   ├── constants/
│   │   └── api.constants.ts       # API configuration constants
│   ├── directives/
│   │   └── alphanumeric-min-length.directive.ts
│   ├── models/                    # TypeScript interfaces/models
│   │   ├── collection.model.ts
│   │   ├── movie.model.ts
│   │   ├── movie-details.model.ts
│   │   └── ...
│   └── services/                 # Core services
│       ├── collections.service.ts # Collection management with signals
│       ├── guest-session.service.ts
│       └── search-state.service.ts
│
├── features/                      # Feature modules
│   ├── collections/              # Collections feature
│   │   ├── collections.component.ts
│   │   ├── collection-details/
│   │   └── create-collection-dialog/
│   ├── search/                   # Search feature
│   │   ├── search.component.ts
│   │   ├── search-results/
│   │   ├── pagination/
│   │   └── add-to-collection-dialog/
│   └── toolbar/                  # Navigation toolbar
│
├── shared/                        # Shared components
│   └── components/
│       ├── movie-details/        # Movie details components
│       └── movie-list/           # Movie list components
│
├── app.ts                         # Root component
├── app.routes.ts                  # Route configuration
└── app.config.ts                  # App configuration
```

## Best Practices Implemented

### 🏗️ Architecture

1. **Feature-Based Structure**: Organized by features (collections, search) rather than by file type
2. **Core vs Features Separation**: Core services separated from feature-specific code
3. **Shared Components**: Reusable components in shared directory
4. **Standalone Components**: All components use Angular's standalone architecture

### 📦 Dependency Injection

- **`inject()` Function**: Modern dependency injection using `inject()` instead of constructor injection
- **Service Providers**: Services provided at root level for singleton pattern
- **Dependency Injection in Tests**: Proper mocking and testing of dependencies

### 🔄 State Management

- **Angular Signals**: Used for reactive state management (collections, search state)
- **Computed Signals**: Derived state calculations (e.g., `collections$`)
- **Effect API**: Side effects for syncing state between services and components
- **Local Storage Integration**: Collections persist using browser localStorage

### 🎨 Component Design

- **Component Composition**: Small, focused components (movie-card, movie-info, movie-stats)
- **Template-Driven Forms**: Angular Material form components
- **Reactive Forms**: Form validation with custom validators
- **Accessibility**: ARIA labels, keyboard navigation support

### 🧪 Testing

- **Unit Tests**: Comprehensive test coverage for services and components
- **Vitest**: Fast, modern testing framework
- **Mocking**: Proper mocking of dependencies (services, router, dialogs)
- **Test Isolation**: Each test is independent with proper setup/teardown

### 🛠️ Code Quality

- **TypeScript Strict Mode**: Type safety throughout the application
- **ESLint Configuration**: Angular-specific linting rules
- **Prettier**: Consistent code formatting
- **Component Selector Naming**: Consistent naming conventions (`app-*` prefix)
- **Directive Selectors**: Attribute-based selectors with camelCase

### 🌐 API Integration

- **Error Handling**: Comprehensive error handling with retry logic
- **HTTP Interceptors**: Centralized error handling (if implemented)
- **Observable Patterns**: Proper use of RxJS operators (map, catchError, retry)
- **Type Safety**: Typed API responses using interfaces

### 💾 Data Persistence

- **Local Storage**: Collections stored in browser localStorage
- **Error Handling**: Graceful handling of localStorage errors
- **Data Validation**: JSON parsing with error handling

### 🎯 Performance

- **OnPush Change Detection**: Where applicable
- **Lazy Loading**: Route-based code splitting
- **Signal-Based Reactivity**: Efficient change detection with signals

### 🔒 Security

- **Environment Variables**: API keys stored in environment files
- **Input Validation**: Form validation and sanitization
- **XSS Prevention**: Angular's built-in sanitization

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm (v11.6.2 or higher)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd moviedex-1
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment:
```bash
cp environment.example.ts environment.ts
```

4. Add your TMDB API key to `environment.ts`:
```typescript
export const environment = {
  apiUrl: 'https://api.themoviedb.org/3',
  apiKey: 'YOUR_API_KEY_HERE',
};
```

Get your API key from [TMDB](https://www.themoviedb.org/settings/api)

### Development

Start the development server:
```bash
npm start
```

Navigate to `http://localhost:4200/`

### Building

Build for production:
```bash
npm run build
```

### Testing

Run unit tests:
```bash
npm test
```

### Code Formatting

Format code:
```bash
npm run format
```

Check formatting:
```bash
npm run format:check
```

### Linting

Run linter:
```bash
npm run lint
```

## Routes

- `/` - Movie search page
- `/movie/:id` - Movie details page
- `/collections` - Collections list page
- `/collections/:id` - Collection details page

## Key Features Implementation

### Collections Management
- Create custom collections with names and descriptions
- Add/remove movies from collections
- View collection details with movie count
- Delete collections with confirmation
- Persistent storage using localStorage

### Movie Search
- Search movies by title
- Paginated results
- Add movies to collections from search results
- Navigate to movie details

### Movie Rating
- Guest session management
- Rate movies (1-10 scale)
- View movie ratings and statistics

## Deployment

### Netlify Deployment

This project is configured for easy deployment on Netlify.

#### Setup Steps:

1. **Push your code to GitHub/GitLab/Bitbucket**

2. **Connect to Netlify**:
   - Go to [Netlify](https://www.netlify.com/)
   - Click "Add new site" → "Import an existing project"
   - Connect your repository

3. **Configure Environment Variables**:
   - Go to Site settings → Environment variables
   - Add the following variable:
     - **Key**: `TMDB_API_KEY`
     - **Value**: Your TMDB API key
   - (Optional) **Key**: `TMDB_API_URL`
     - **Value**: `https://api.themoviedb.org/3` (default)

4. **Build Settings** (should auto-detect from `netlify.toml`):
   - **Build command**: `npm run build:netlify`
   - **Publish directory**: `dist/moviedex/browser`

5. **Deploy**:
   - Click "Deploy site"
   - Netlify will automatically build and deploy your app

#### How It Works:

The `build:netlify` script:
- Reads `TMDB_API_KEY` and `TMDB_API_URL` from Netlify environment variables
- Generates `environment.ts` dynamically before building
- Builds the Angular app with the correct API configuration

#### Local Development vs Production:

- **Local**: Copy `environment.example.ts` to `environment.ts` and add your API key
- **Netlify**: Uses environment variables set in Netlify dashboard (no file needed)

## Development Notes

- All components are standalone (no NgModules)
- Uses Angular Signals for reactive state management
- Material Design components for UI consistency
- Tailwind CSS for utility-based styling
- Comprehensive test coverage with Vitest
- Environment variables handled securely for deployment

## License

This project is private and for personal/educational use.
