import React from "react";

interface HikeIconProps extends React.SVGProps<SVGSVGElement> {
  hiked?: boolean;
  className?: string;
}

export const HikeIcon: React.FC<HikeIconProps> = ({
  hiked = false,
  className = "w-5 h-5",
  ...props
}) => {
  const gradientId = React.useId();

  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <defs>
        {/* Emerald green gradient matching user reference */}
        <linearGradient id={`${gradientId}-grad`} x1="10%" y1="90%" x2="95%" y2="15%">
          <stop offset="0%" stopColor="#047857" />
          <stop offset="35%" stopColor="#059669" />
          <stop offset="70%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#34d399" />
        </linearGradient>
        
        {/* Drop shadow for glow when active */}
        <filter id={`${gradientId}-glow`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#10b981" floodOpacity="0.45" />
        </filter>
      </defs>

      {hiked ? (
        /* Hiked active state: Rich ascending zigzag ribbon + solid arrowhead with gradient */
        <g filter={`url(#${gradientId}-glow)`}>
          {/* Zigzag ribbon body */}
          <path
            d="M 14 80
               L 29 59
               L 39 71
               L 53 47
               L 64 61
               L 77 42
               L 71 35
               L 59 52
               L 48 37
               L 34 58
               L 24 45
               L 10 70
               Z"
            fill={`url(#${gradientId}-grad)`}
          />
          {/* Arrowhead */}
          <polygon
            points="63,33 93,20 84,52 75,41"
            fill={`url(#${gradientId}-grad)`}
          />
        </g>
      ) : (
        /* Unhiked idle state: Clean stroked outline matching layout / currentColor */
        <g>
          {/* Smooth zigzag path */}
          <path
            d="M 12 75 L 29 53 L 41 68 L 56 46 L 66 58 L 81 37"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Arrowhead */}
          <path
            d="M 64 34 L 88 23 L 80 50"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      )}
    </svg>
  );
};

export default HikeIcon;
