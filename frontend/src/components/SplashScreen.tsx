import { useState, useCallback } from "react";

type Props = {
    onDismiss: () => void;
};

// matches .css transition
const LEAVE_DURATION_MS = 1050;

export default function SplashScreen({ onDismiss }: Props) {
    const [isLeaving, setIsLeaving] = useState(false);

    const dismiss = useCallback(() => {
        if (isLeaving) return;
        setIsLeaving(true);
        window.setTimeout(onDismiss, LEAVE_DURATION_MS);
    }, [isLeaving, onDismiss]);

    function handleKey(e: React.KeyboardEvent<HTMLDivElement>) {
        if (e.key === "Enter" || e.key === " " || e.key === "Escape") {
            e.preventDefault();
            dismiss();
        }
    }

    const letters = "Planent".split("");

    return (
        <div
            className={`splash-screen${isLeaving ? " splash-leaving" : ""}`}
            onClick={dismiss}
            onKeyDown={handleKey}
            role="button"
            tabIndex={0}
            aria-label="Enter Planent"
        >
            <div className="splash-stars" aria-hidden="true" />
            <div className="splash-stars splash-stars-2" aria-hidden="true" />

            <div className="splash-content">
                <div className="splash-earth-stage" aria-hidden="true">
                    <div className="splash-atmosphere" />
                    <div className="splash-earth">
                        <div className="splash-earth-texture" />
                        <div className="splash-shading" />
                    </div>
                    <div className="splash-orbit">
                        <div className="splash-moon" />
                    </div>
                </div>

                <h1 className="splash-title">
                    {letters.map((letter, i) => (
                        <span key={i} style={{ animationDelay: `${0.9 + i * 0.1}s` }}>
                            {letter}
                        </span>
                    ))}
                </h1>
                <p className="splash-tagline">a world full of events</p>
            </div>

            <p className="splash-hint">Tap anywhere to enter</p>
        </div>
    );
}