'use client';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

import { BackButtonProps } from '@/interfaces';

export default function BackButton({href, onClick, text}: BackButtonProps) {
    const router = useRouter();

    const handleClick = () => {
        if (onClick) {
            onClick();
        } else if (href) {
            router.push(href);
        } else {
            router.back();
        }
    };

    return (
        <div className={`mb-6 text-left`}>
            <button
                type="button"
                onClick={handleClick}
                className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors group"
            >
                <FontAwesomeIcon
                    icon={faArrowLeft}
                    className="transition-transform group-hover:-translate-x-1"
                />
                {text}
            </button>
        </div>
    );
}
