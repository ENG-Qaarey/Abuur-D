"use client";

type AnimatedSparklineProps = {
    gradientId: string;
    path: string;
    stroke: string;
    /** Stagger draw / pulse per card (ms) */
    delay?: number;
    className?: string;
};

export function AnimatedSparkline({
    gradientId,
    path,
    stroke,
    delay = 0,
    className = "w-full h-full",
}: AnimatedSparklineProps) {
    const areaPath = `${path} L 60 20 L 0 20 Z`;

    return (
        <svg
            className={`${className} overflow-hidden sparkline-chart`}
            viewBox="0 0 60 20"
            aria-hidden
            style={{ ["--sparkline-delay" as string]: `${delay}ms`, ["--sparkline-color" as string]: stroke }}
        >
            <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={stroke} stopOpacity="0.5" />
                    <stop offset="50%" stopColor={stroke} stopOpacity="0.22" />
                    <stop offset="100%" stopColor={stroke} stopOpacity="0" />
                </linearGradient>
                <clipPath id={`${gradientId}-clip`}>
                    <rect x="0" y="0" width="60" height="20" />
                </clipPath>
            </defs>

            {/* Soft scrolling wave behind the main chart */}
            <g clipPath={`url(#${gradientId}-clip)`} className="sparkline-drift-wrap">
                <g className="sparkline-drift">
                    <path d={areaPath} fill={`url(#${gradientId})`} opacity="0.45" />
                    <path d={path} fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.25" />
                </g>
                <g className="sparkline-drift" transform="translate(60, 0)">
                    <path d={areaPath} fill={`url(#${gradientId})`} opacity="0.45" />
                    <path d={path} fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.25" />
                </g>
            </g>

            <path className="sparkline-area--front" d={areaPath} fill={`url(#${gradientId})`} />
            <path
                className="sparkline-stroke--front"
                d={path}
                fill="none"
                stroke={stroke}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}
