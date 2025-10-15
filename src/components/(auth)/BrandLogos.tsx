"use client";

import Image from "next/image";
import Link from "next/link";

export default function BrandLogos() {
  return (
    <div className="mt-8 text-center">
      <div className="flex justify-center space-x-2 mt-2">
        <div className="w-2 h-2 bg-blue-700 rounded-full"></div>
        <div className="w-2 h-2 bg-blue-700 rounded-full"></div>
        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
        <Image
          src="/images/logos/decareer.png"
          width={120}
          height={40}
          alt="DeCareer logo"
          className="object-contain"
        />
        <Image
          src="/images/logos/decourse.png"
          width={120}
          height={40}
          alt="DeCourse logo"
          className="object-contain"
        />
        <Image
          src="/images/logos/dedao.png"
          width={150}
          height={60}
          alt="DeDao logo"
          className="object-contain"
        />
        <Image
          src="/images/logos/defuel.png"
          width={120}
          height={60}
          alt="DeFuel logo"
          className="object-contain"
        />
        <Image
          src="/images/logos/dehive.png"
          width={120}
          height={60}
          alt="DeHive logo"
          className="object-contain"
        />
        <Image
          src="/images/logos/deid.png"
          width={60}
          height={20}
          alt="DEiD logo"
          className="object-contain"
        />
      </div>

      {/* Terms */}
      <p className="text-xs text-gray-400 text-center">
        By continuing, you agree to our{" "}
        <Link
          href="/terms-and-privacy/terms"
          className="text-blue-500 hover:underline"
        >
          Terms
        </Link>{" "}
        and acknowledge our{" "}
        <Link
          href="/terms-and-privacy/privacy"
          className="text-blue-500 hover:underline"
        >
          Privacy Policy
        </Link>
      </p>

      {/* Footer */}
      <div className="text-center mt-12">
        <p className="text-gray-400 text-sm">
          © {new Date().getFullYear()} Decode Network. All rights reserved.
        </p>
      </div>
    </div>
  );
}
