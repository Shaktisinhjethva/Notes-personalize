# Error404 Pro - Advanced Note-Taking System

Error404 Pro is a high-performance, Samsung Notes-inspired web application designed for power users. It combines traditional note-taking with digital ink, advanced AI intelligence, and real-time voice interaction.

## 🔑 API Key Setup

This application requires a **Google Gemini API Key** to power its intelligent features (Summarization, Handwriting OCR, and Live Voice).

### 1. Obtain a Key
- Visit the [Google AI Studio](https://aistudio.google.com/) to generate your API key.
- Ensure your project has the necessary quotas for Gemini 3 and Gemini 2.5 models.

### 2. Configuration
The application expects the API key to be provided via the environment variable `process.env.API_KEY`. 

- **Local Development**: If you are using a build tool or sandbox, ensure `API_KEY` is defined in your environment or `.env` file.
- **Production**: The key is injected automatically into the execution context.

### 3. Billing & Limits
For advanced features or high-volume usage, refer to the [Gemini API Billing Documentation](https://ai.google.dev/gemini-api/docs/billing).

---

## 🚀 Core Features

- **Dynamic Workspace**: Fluid "fit-to-screen" layout that adapts perfectly to desktop and mobile viewports.
- **Digital Ink (Canvas)**: A built-in drawing engine for sketches and handwritten annotations.
- **AI Intelligence (Gemini 3/2.5)**:
  - **Summarization**: Condense long documents into key insights.
  - **Tone Improvement**: Refine your writing style with AI-driven suggestions.
  - **Smart Tagging**: Automatic extraction of relevant hashtags.
  - **Handwriting OCR**: Transcribe digital drawings into searchable text.
- **Command Center (Admin)**: Complete user directory management, system configuration, and tag indexing.
- **Live Intelligence**: Real-time voice-to-text and conversational AI integration using the Gemini Live API.

## 🛠 Technical Stack

- **Framework**: React 19 (ESM)
- **Styling**: Tailwind CSS & Bootstrap 5.3 (Glassmorphism UI)
- **Icons**: Lucide React
- **AI Engine**: `@google/genai` (Gemini 3 Flash/Pro & 2.5 Flash Native Audio)
- **State Management**: React Hooks & LocalStorage Persistence

## 🎤 How "Live" Works

The "Live" feature utilizes the **Gemini Live API** to enable low-latency, real-time voice interactions.

1. **Session Setup**: Connects to `gemini-2.5-flash-native-audio-preview-12-2025` via WebSockets.
2. **Audio Streaming**: Captures microphone input at 16kHz PCM and streams it to the model.
3. **Real-time Transcription**: As you speak, the model processes the audio and returns transcriptions via the `inputAudioTranscription` and `outputAudioTranscription` modalities.
4. **Contextual Awareness**: The model can "hear" your voice and interact conversationally, allowing you to dictate notes or ask for summaries hands-free.

## 🔒 Security

- **Access Tiers**: Separate Admin and External login flows.
- **Security Alerts**: Automatic simulated dispatch of access logs to user emails upon every login.
- **Command Control**: Admins can revoke user access and manage global system settings.
