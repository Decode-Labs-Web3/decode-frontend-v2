'use client';

import Image from 'next/image';

export default function Logo() {
    return (
        <div className="flex items-center space-x-2 mb-8">
            <Image src="/assets/3d_token_nobg.png" width={50} height={50} alt="Logo Icon" />
            <span className="text-2xl font-semibold">decode protocol</span>
        </div>
    );
}


