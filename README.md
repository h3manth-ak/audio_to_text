# Audio to Text Website

This project is a web application that converts audio files to text using React and the Deepgram API. It provides a user-friendly interface for uploading audio files and retrieving their transcriptions.

## Features

- **Real-time Transcription**: Utilizes the Deepgram API to transcribe audio to text in real-time.
- **User Interface**: Built with React for a responsive and interactive user experience.

## Getting Started

### Prerequisites

- Node.js and npm installed on your machine.
- A Deepgram API key. You can sign up for an API key here.

### Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/h3manth-ak/audio_to_text.git
    cd audio_to_text
    ```

2. Install the dependencies:
    ```bash
    npm install
    ```

3. Create a `.env` file in the root directory and add your Deepgram API key:
    ```env
    REACT_APP_DEEPGRAM_API_KEY=your_deepgram_api_key
    ```

4. Start the development server:
    ```bash
    npm start
    ```

## Usage

1. Open your browser and navigate to `http://localhost:3000`.
2. Upload an audio file using the provided interface.
3. Wait for the transcription to be processed and displayed on the screen.

## Built With

- React - A JavaScript library for building user interfaces.
- Deepgram API - A speech-to-text API for transcribing audio.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes also welcoming the intresting ideas related to this 

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Thanks to Deepgram for providing the API used in this project.
- Inspired by the need for accurate and efficient audio transcription tools.

