import React from 'react';

export default function AmLogo() {
    return (
        <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl shadow-lg shadow-indigo-500/30 border border-white/10">
            <svg
                viewBox="0 0 40 40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-8 h-8 drop-shadow-md"
            >
                {/* Book Base / Letter M shape */}
                <path
                    d="M8 28V14C8 12 10 10 12 10H18C19 10 20 11 20 12V26C20 27 19 28 18 28H8Z"
                    fill="url(#paint0_linear)"
                    fillOpacity="0.9"
                />
                <path
                    d="M32 28V14C32 12 30 10 28 10H22C21 10 20 11 20 12V26C20 27 21 28 22 28H32Z"
                    fill="url(#paint1_linear)"
                    fillOpacity="0.7"
                />
                {/* Letter A overlay */}
                <path
                    d="M20 8L13 24H16L17.5 20H22.5L24 24H27L20 8ZM18.5 17L20 13L21.5 17H18.5Z"
                    fill="white"
                />
                {/* Sparkle/Star */}
                <path
                    d="M28 6L29 9L32 10L29 11L28 14L27 11L24 10L27 9L28 6Z"
                    fill="#FDE047"
                />
                <defs>
                    <linearGradient id="paint0_linear" x1="14" y1="10" x2="14" y2="28" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#A78BFA" />
                        <stop offset="1" stopColor="#6D28D9" />
                    </linearGradient>
                    <linearGradient id="paint1_linear" x1="26" y1="10" x2="26" y2="28" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#C4B5FD" />
                        <stop offset="1" stopColor="#8B5CF6" />
                    </linearGradient>
                </defs>
            </svg>
        </div>
    );
}
