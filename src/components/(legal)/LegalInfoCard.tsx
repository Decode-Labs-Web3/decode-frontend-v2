"use client";

import Link from "next/link";

export default function LegalInfoCard() {
  return (
    <>
      {/* Contact Information */}
      <div className="bg-white/5 rounded-2xl p-6 border border-white/10 mb-6">
        <h2 className="text-2xl font-bold mb-4">Contact Information</h2>
        <div className="ml-4">
          <p className="leading-relaxed mb-4">
            If you have any questions about our Terms of Service or Privacy
            Policy, please contact us at:
          </p>
          <div className="space-y-2">
            <p>
              <strong>Email:</strong> decodenetwork@gmail.com
            </p>
            <p>
              <strong>Website:</strong>{" "}
              <Link href="/" className="hover:underline">
                Decode Network
              </Link>
            </p>
            <p className="mb-4">
              <strong>Address:</strong> University of Greenwich, Ho Chi Minh
              City, Vietnam
            </p>
          </div>
        </div>

        {/* Team Information */}
        <div className="bg-white/5 rounded-2xl p-6 border border-white/10 mb-6">
          <h2 className="text-2xl font-bold mb-4">Development Team</h2>

          <div className="ml-4">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2 ml-2">
                  Nguyễn Đình Hoàng Sơn – Founder
                </h3>
                <p>
                  Backend Lead | Fullstack Developer | Specializing in Backend
                  Development
                </p>
                <p>
                  <strong>GitHub:</strong>{" "}
                  <Link
                    href="https://github.com/Pasonnn"
                    target="_blank"
                    className="hover:underline"
                  >
                    Pasonnn
                  </Link>
                </p>
                <p>
                  <strong>Email:</strong>{" "}
                  <a
                    href="mailto:pason.dev@gmail.com"
                    className="hover:underline"
                  >
                    pason.dev@gmail.com
                  </a>
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2 ml-2">
                  Vũ Trần Quang Minh – Co-Founder
                </h3>
                <p>
                  Frontend Lead | Fullstack Developer | Specializing in Frontend
                  Development
                </p>
                <p>
                  <strong>GitHub:</strong>{" "}
                  <Link
                    href="https://github.com/vutranquangminh"
                    target="_blank"
                    className="hover:underline"
                  >
                    vutranquangminh
                  </Link>
                </p>
                <p>
                  <strong>Email:</strong>{" "}
                  <a
                    href="mailto:vutranquangminh.dev@gmail.com"
                    className="hover:underline"
                  >
                    vutranquangminh.dev@gmail.com
                  </a>
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2 ml-2">
                  Lê Nguyên Khang – Co-Founder
                </h3>
                <p>Backend Developer | Specializing in Backend Development</p>
                <p>
                  <strong>GitHub:</strong>{" "}
                  <Link
                    href="https://github.com/Rimz1701"
                    target="_blank"
                    className="hover:underline"
                  >
                    Rimz1701
                  </Link>
                </p>
                <p>
                  <strong>Email:</strong>{" "}
                  <a
                    href="mailto:emkhang.devlo@gmail.com"
                    className="hover:underline"
                  >
                    emkhang.devlo@gmail.com
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 p-6 bg-gradient-to-r from-blue-900/30 to-indigo-900/30 rounded-2xl border border-blue-500/40 shadow-lg">
        <h3 className="text-xl font-semibold mb-3">About this Project</h3>
        <p className="text-base leading-loose">
          This platform was developed as the final-year project at the
          University of Greenwich, showcasing our team&apos;s ability to design
          and implement modern Web3 solutions. The application highlights
          advanced fullstack development skills, with strong emphasis on backend
          reliability, frontend usability, and privacy-conscious architecture.
        </p>
        <p className="text-base leading-loose mt-4">
          Although this project was built in an academic setting, it reflects
          professional software engineering practices including modular design,
          secure API integration, and attention to user data protection. For
          real-world deployment, additional steps such as industry-grade privacy
          compliance audits, enhanced security hardening, and legal review would
          be required to ensure the platform meets production standards.
        </p>
      </div>

      {/* Footer */}
      <div className="text-center mt-12">
        <div className="flex justify-center gap-6 mt-4">
          <Link
            href="/terms-and-privacy/terms"
            className="hover:underline text-sm"
          >
            Terms of Service
          </Link>
          <Link
            href="/terms-and-privacy/privacy"
            className="hover:underline text-sm"
          >
            Privacy Policy
          </Link>
          <Link href="/" className="hover:underline text-sm">
            Home
          </Link>
        </div>

        <p className="text-sm">
          © {new Date().getFullYear()} Decode Network. All rights reserved.
        </p>
      </div>
    </>
  );
}
