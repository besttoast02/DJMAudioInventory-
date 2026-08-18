# Layout Components Log

This folder contains the layout components for the DJM frontend.

## Changes on August 18, 2026

- **ClientChatbot.tsx**: Refactored to render the Floating Action Button (FAB) statically and load the heavy Chatbot component dynamically upon interaction. Replaced Lucide icons with custom inline SVG path.
- **Chatbot.tsx**: Modified to accept `isOpen` and `onClose` props, removing internal toggle state and duplicate FAB markup.
- **Footer.tsx**: Added navigation links to the newly created Accessibility and Cancellation Policy compliance pages.
