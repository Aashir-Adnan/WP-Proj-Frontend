import { useState, useEffect } from "react";
import "./Title.css";
export default function HeaderTitle() {
    const mainText = "SchröSite";
    const altText = "Did it ever really exist?";
    const typingSpeed = 100;
    const pauseTime = 1500;
    const [displayText, setDisplayText] = useState(mainText);
    const [typing, setTyping] = useState(false);
    const [isAlt, setIsAlt] = useState(false);

    useEffect(() => {
        const typeMessage = async () => {
            setTyping(true);
            let text = isAlt ? mainText : altText;

            for (let i = displayText.length; i >= 0; i--) {
                setDisplayText(displayText.slice(0, i));
                await new Promise(r => setTimeout(r, typingSpeed / 2));
            }
            await new Promise(r => setTimeout(r, pauseTime / 2));

            setIsAlt(!isAlt);
            
            for (let i = 0; i <= text.length; i++) {
                setDisplayText(text.slice(0, i));
                await new Promise(r => setTimeout(r, typingSpeed));
            }

            setTyping(false);
        };

        const interval = setInterval(() => {
            if (!typing) typeMessage();
        }, 10000);

        return () => clearInterval(interval);
    }, [displayText, typing, isAlt]);

    return (
        <div
            style={{
                display: "inline-block",
                fontSize: isAlt ? "1em" :"2em",
                fontWeight: "bold",
                color: "#fff",
                whiteSpace: "nowrap",
                padding: isAlt ? "32px 36px" : "20px 36px"
            }}
        >
            {displayText}
            <span className="cursor">|</span>
        </div>
    );
}
