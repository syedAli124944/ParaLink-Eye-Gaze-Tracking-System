# EOG Communication System for Paralyzed People

A comprehensive and accessible communication application designed specifically for paralyzed patients using **Electrooculography (EOG)** technology. This application provides an intuitive interface that enables users to communicate, access news, and reach emergency contacts through eye movements.

## 🎯 Project Overview

This Final Year Project (FYP) aims to bridge the communication gap for paralyzed individuals by leveraging EOG signals to create a user-friendly, accessible digital communication platform. The application features calming colors, smooth animations, and large interactive elements optimized for EOG-based interaction.

## ✨ Key Features

### 🔐 Authentication System
- **Secure Login & Signup**: User authentication using local session storage
- **Animated Transitions**: Smooth, calming animations throughout the auth flow
- **User-Friendly Forms**: Large, accessible input fields designed for EOG interaction

### 🏠 Main Dashboard
- **Welcome Animation**: Engaging welcome screen on first login
- **Sidebar Navigation**: Easy access to:
  - Home
  - Contact
  - About
  - Language Selector
- **Interactive Category Cards**:
  - Communication Module
  - News Section
  - Emergency Contacts

### 💬 Communication Module
- **Emotion Expression**: Selectable emotion cards with:
  - Visual emoji representations
  - Clear descriptions
  - Large, accessible buttons
- **Quick Communication**: Pre-defined phrases for common needs

### 📰 News Section
- Browse news by categories
- Accessible content presentation
- Easy navigation between articles

### 🚨 Emergency Contacts
- Quick access to critical contacts
- One-tap emergency notifications
- Pre-configured emergency messages

### 🌍 Multi-Language Support
- Language selector integrated into the interface
- Persistent language preferences
- Support for multiple languages

## 🛠️ Technology Stack

### Frontend
- **React 18.3.1**: Modern UI library for building interactive interfaces
- **Vite 5.4.2**: Fast build tool and development server
- **Tailwind CSS 3.4.1**: Utility-first CSS framework for styling

### Backend & Database
- **FastAPI**: High-performance, easy-to-learn Python web framework
- **Python**: Backend scripting and hardware communication

### Development Tools
- **ESLint**: Code linting and quality assurance
- **PostCSS & Autoprefixer**: CSS processing and browser compatibility

### UI Components
- **Lucide React**: Beautiful, consistent icons

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher)
- **npm** or **yarn** package manager
- **Python** (v3.8 or higher)

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd FYP_EOG_System_For_Paralyzed_people
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Python Backend**
   
   Navigate to the backend directory and run the server:
   ```bash
   cd backend
   pip install -r requirements.txt
   python main.py
   ```

## 💻 Usage

### Development Mode

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5174` (or `5173` if no other projects are running).

> [!TIP]
> Always check your terminal output after running `npm run dev` to see the exact URL.

### Build for Production

Create an optimized production build:
```bash
npm run build
```

### Preview Production Build

Preview the production build locally:
```bash
npm run preview
```

### Linting

Run ESLint to check code quality:
```bash
npm run lint
```

## 📁 Project Structure

```
FYP_EOG_System_For_Paralyzed_people/
├── src/
│   ├── components/          # React components
│   │   ├── Dashboard.jsx    # Main dashboard
│   │   ├── Login.jsx        # Login component
│   │   ├── SignUp.jsx       # Signup component
│   │   ├── WelcomeScreen.jsx # Welcome animation
│   │   └── Sidebar.jsx      # Navigation sidebar
│   ├── contexts/            # React contexts
│   │   ├── AuthContext.jsx  # Authentication context
│   │   └── EogContext.jsx   # EOG tracking context
│   ├── hooks/               # Custom React hooks
│   ├── services/            # Backend and API services
│   ├── App.jsx              # Main application component
│   ├── main.jsx             # Application entry point
│   └── index.css            # Global styles
├── backend/                 # FastAPI backend server
├── public/                  # Static assets
├── package.json             # Dependencies and scripts
├── tailwind.config.js       # Tailwind CSS configuration
├── vite.config.js           # Vite configuration
└── README.md                # This file
```

## 🎨 Design Philosophy

The application is built with **accessibility and usability** as top priorities:

- **Calming Color Palette**: Teal and cyan gradients to reduce visual stress
- **Large Interactive Elements**: Optimized for EOG-based selection
- **Smooth Animations**: Gentle transitions that provide feedback without overwhelming
- **High Contrast**: Ensures readability for users with varying visual abilities
- **Responsive Design**: Works across different screen sizes and devices

## 🔒 Security

- Secure local session managementt
- Session management with automatic state cleanup
- All user data is encrypted and stored securely
- Session management with automatic token refresh

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is part of a Final Year Project (FYP) and is intended for educational purposes.

## 👥 Authors

Final Year Project - EOG System Development Team

## 🙏 Acknowledgments

- Special thanks to all contributors and testers
- Inspired by the need to improve quality of life for paralyzed individuals
- Built with modern web technologies and accessibility best practices

## 📧 Contact

For questions, suggestions, or collaboration opportunities, please reach out through the project's issue tracker.

---

**Note**: This is an active development project. Features and documentation will be updated regularly.
