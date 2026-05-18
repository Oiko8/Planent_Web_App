type LoaderProps = {
    text?: string;
};

export default function Loader({ text = "Loading" }: LoaderProps) {
    return (
        <div className="loader" role="status" aria-live="polite">
            <div className="loader-spinner" aria-hidden="true" />
            <p className="loader-text">
                {text}
                <span className="loader-dot">.</span>
                <span className="loader-dot">.</span>
                <span className="loader-dot">.</span>
            </p>
        </div>
    );
}