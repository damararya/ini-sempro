export default function ApplicationLogo({ className = '', alt = 'Logo', ...props }) {
    return (
        <img
            src="/images/logo.svg"
            alt={alt}
            className={className}
            {...props}
        />
    );
}
