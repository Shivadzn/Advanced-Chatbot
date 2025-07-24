# Advanced Chatbot Project

## Project Info

---

## Demo

Watch a quick demo of the chatbot in action:

[![Chatbot Demo](https://img.youtube.com/vi/YOUR_VIDEO_ID/0.jpg)](https://www.youtube.com/watch?v=YOUR_VIDEO_ID)

*Replace `YOUR_VIDEO_ID` with your actual YouTube video ID.*

---

## Table of Contents
1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Getting Started](#getting-started)
4. [Usage](#usage)
5. [Architecture Overview](#architecture-overview)
6. [Deployment](#deployment)
7. [Custom Domain](#custom-domain)
8. [Contributing](#contributing)
9. [License](#license)
10. [Acknowledgements](#acknowledgements)

---

## Features
- Conversational AI chatbot
- Voice input and output (speech recognition and TTS)
- Session management and chat history
- Modern UI with shadcn-ui and Tailwind CSS

---

## Tech Stack

### Frontend
- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

### Backend
- FastAPI
- Python
- LangChain
- (Add any other backend libraries or services you use, e.g., SQLAlchemy, SQLite, etc.)

---

## Getting Started

### Prerequisites
- Node.js & npm ([install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating))

### Installation & Running Locally
```sh
# Clone the repository
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>

# Install dependencies
npm i

# Start the development server
npm run dev
```

---

## Usage
- Type or speak your message in the input area.
- The bot will respond with text and optionally with voice.
- Use the mute/unmute button to control TTS output.
- View or delete chat history as needed.

---

## Architecture Overview

### Main Chat Flow
This diagram shows the journey of a user message through the chat app:
- The user can type or speak a message.
- The input is processed and sent to the backend.
- The backend response updates the UI and may trigger voice output.
- Components are grouped by their roles (UI, State Management, Voice, Backend).
- Arrows show the direction of data and control flow.

```mermaid
flowchart TD
  A["User"] -->|"Types or Speaks"| B["Input Area"]
  B -->|"Text"| C["handleSendMessage"]
  B -->|"Voice"| D["VoiceButton"]
  D -->|"Speech Recognition"| C
  C -->|"API Call"| E["Backend /api/generate/"]
  E -->|"Response"| F["Update Messages State"]
  F --> G["ChatMessage List"]
  F --> H["TypingIndicator"]
  F --> I["SpeechSynthesis (TTS)"]
  I --> J["Voice Output"]
  G --> K["UI Render"]
  H --> K
  J --> K

  %% Groupings for clarity
  subgraph "UI Components"
    B
    D
    G
    H
  end
  subgraph "State Management"
    F
    C
  end
  subgraph "Voice"
    D
    I
    J
  end
  subgraph "Backend"
    E
  end

  %% Styling for emphasis
  style A fill:#f9f,stroke:#333,stroke-width:2px,color:#000
  style E fill:#bbf,stroke:#333,stroke-width:2px,color:#000
  style I fill:#bfb,stroke:#333,stroke-width:2px,color:#000
  style J fill:#bfb,stroke:#333,stroke-width:2px,color:#000
```

### State Management (Detailed)
This diagram illustrates the main states of the chat application and how it transitions between them:
- Each state block represents a mode the app can be in (e.g., waiting for input, processing speech, waiting for a backend response).
- Arrows show how user actions, backend responses, or errors move the app from one state to another.
- Error and configuration transitions are included for completeness.
- Colors and notes help clarify each state and transition.

```mermaid
%%{init: {'theme':'base', 'themeVariables': { 'primaryColor': '#ff0000', 'primaryTextColor': '#000000', 'primaryBorderColor': '#7C0000', 'lineColor': '#F8B229', 'sectionBkgColor': '#00ff00', 'altSectionBkgColor': '#0000ff', 'gridColor': '#cccccc', 'secondaryColor': '#006100', 'tertiaryColor': '#fff', 'background': '#ffffff', 'mainBkg': '#ECECFF', 'secondBkg': '#ffffde', 'tertiaryBkg': '#ECECFF'}}}%%
stateDiagram-v2
    [*] --> Idle

    Idle --> Listening : User clicks voice button
    Listening --> Processing : Speech detected
    Processing --> Idle : Speech processed/cancelled

    Idle --> Typing : User types message
    Typing --> Sending : Message submitted
    Sending --> WaitingForResponse : API call initiated

    WaitingForResponse --> Speaking : Response received & TTS enabled
    WaitingForResponse --> DisplayingText : Response received & TTS disabled

    Speaking --> Idle : TTS playback complete
    DisplayingText --> Idle : Text displayed

    %% Self-transitions for configuration changes
    Idle --> Idle : Settings changed\n(mute/unmute, session reset)

    %% Error handling transitions
    Listening --> Idle : Error/timeout
    Processing --> Idle : Processing failed
    Sending --> Idle : Send failed
    WaitingForResponse --> Idle : Request timeout/error
    Speaking --> Idle : TTS error/interrupted

    %% State descriptions
    state Idle {
        [*] --> Ready
        Ready : Ready for user input
        Ready : Voice/text input available
    }

    state Listening {
        [*] --> Recording
        Recording : Capturing audio input
        Recording : Visual feedback active
    }

    state Processing {
        [*] --> Converting
        Converting : Speech-to-text conversion
        Converting : Processing user intent
    }

    state Typing {
        [*] --> Composing
        Composing : User composing message
        Composing : Real-time input validation
    }

    state Sending {
        [*] --> Transmitting
        Transmitting : Sending to backend
        Transmitting : Request in flight
    }

    state WaitingForResponse {
        [*] --> Pending
        Pending : Awaiting AI response
        Pending : Loading indicator active
    }

    state Speaking {
        [*] --> Synthesizing
        Synthesizing --> Playing
        Playing : TTS audio output
        Playing : Playback controls available
    }

    state DisplayingText {
        [*] --> Rendering
        Rendering : Formatting response
        Rendering : Text animation/typing effect
    }

    %% SUPER BOLD COLORS, green blocks with white text
    style Idle fill:#FF6B6B,stroke:#C44569,stroke-width:5px,color:#000000
    style Listening fill:#4ECDC4,stroke:#26A69A,stroke-width:5px,color:#FFFFFF
    style Processing fill:#FFE66D,stroke:#FF8B94,stroke-width:5px,color:#000000
    style Typing fill:#A8E6CF,stroke:#56C596,stroke-width:4px,color:#FFFFFF
    style Sending fill:#FFD93D,stroke:#FFA726,stroke-width:4px,color:#000000
    style WaitingForResponse fill:#6BCF7F,stroke:#4CAF50,stroke-width:5px,color:#FFFFFF
    style Speaking fill:#C44569,stroke:#8E24AA,stroke-width:5px,color:#000000
    style DisplayingText fill:#42A5F5,stroke:#1976D2,stroke-width:4px,color:#000000

    %% Additional color enhancements for transitions
    classDef primaryTransition stroke:#ff6b6b,stroke-width:3px
    classDef secondaryTransition stroke:#4ecdc4,stroke-width:2px
    classDef errorTransition stroke:#ff9f43,stroke-width:2px,stroke-dasharray: 5 5
```

---

## Deployment

Simply open [Lovable](https://lovable.dev/projects/346d97cd-baa4-4aec-affe-b14c90da28a0) and click on Share -> Publish.

---

## Custom Domain

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

---

## Contributing

Contributions are welcome! To contribute:
- Fork this repository
- Create a new branch for your feature or bugfix
- Make your changes and commit them with clear messages
- Push your branch and open a Pull Request

Please follow the existing code style and conventions. For major changes, open an issue first to discuss what you would like to change.

---

## License

This project is licensed under the MIT License. See the [LICENSE](MIT) file for details.

---

## Acknowledgements

- [Lovable](https://lovable.dev/) for the project platform
- [shadcn-ui](https://ui.shadcn.com/) for UI components
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Mermaid](https://mermaid-js.github.io/) for diagrams
- [Vite](https://vitejs.dev/) and [React](https://react.dev/) for the frontend framework

Special thanks to all low code frameworks and open-source libraries that made this project possible.
