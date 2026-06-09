import { useState, useEffect } from 'react';
import './Typewriter.css';

const phrases = [
    "perform a web search...",
    "find detailed information...",
    "write and debug some code...",
    "summarize long articles..."
];

function Typewriter() {
    const [currentPhraseIdx, setCurrentPhraseIdx] = useState(0);
    const [displayedText, setDisplayedText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [typingSpeed, setTypingSpeed] = useState(100);

    useEffect(() => {
        const fullPhrase = phrases[currentPhraseIdx];
        
        const handleTyping = () => {
            if (!isDeleting) {
                // Add a letter
                setDisplayedText(fullPhrase.substring(0, displayedText.length + 1));
                setTypingSpeed(100); // Normal typing speed

                // If phrase is fully typed, pause, then start deleting
                if (displayedText === fullPhrase) {
                    setTypingSpeed(2000); // Long pause at the end of the phrase
                    setIsDeleting(true);
                }
            } else {
                // Remove a letter
                setDisplayedText(fullPhrase.substring(0, displayedText.length - 1));
                setTypingSpeed(50); // Faster speed while deleting

                // If phrase is completely erased, move to the next phrase
                if (displayedText === '') {
                    setIsDeleting(false);
                    setCurrentPhraseIdx((prev) => (prev + 1) % phrases.length);
                    setTypingSpeed(500); // Short pause before starting next word
                }
            }
        };

        const timer = setTimeout(handleTyping, typingSpeed);
        return () => clearTimeout(timer);
    }, [displayedText, isDeleting, currentPhraseIdx, typingSpeed]);

    return (
        <span className="typewriter-container">
            {displayedText}
            <span className="typewriter-cursor">|</span>
        </span>
    );
}

export default Typewriter;