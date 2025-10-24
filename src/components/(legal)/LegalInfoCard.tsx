"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function LegalInfoCard() {
  return (
    <>
      {/* Contact Information */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent>
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
              <Button variant="link" asChild className="p-0 h-auto">
                <Link href="/">Decode Network</Link>
              </Button>
            </p>
            <p className="mb-4">
              <strong>Address:</strong> University of Greenwich, Ho Chi Minh
              City, Vietnam
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Team Information */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Development Team</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">
                Nguyễn Đình Hoàng Sơn – Founder
              </h3>
              <p>
                Backend Lead | Fullstack Developer | Specializing in Backend
                Development
              </p>
              <p>
                <strong>GitHub:</strong>{" "}
                <Button variant="link" asChild className="p-0 h-auto">
                  <Link href="https://github.com/Pasonnn" target="_blank">
                    Pasonnn
                  </Link>
                </Button>
              </p>
              <p>
                <strong>Email:</strong>{" "}
                <Button variant="link" asChild className="p-0 h-auto">
                  <a href="mailto:pason.dev@gmail.com">pason.dev@gmail.com</a>
                </Button>
              </p>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-semibold mb-2">
                Vũ Trần Quang Minh – Co-Founder
              </h3>
              <p>
                Frontend Lead | Fullstack Developer | Specializing in Frontend
                Development
              </p>
              <p>
                <strong>GitHub:</strong>{" "}
                <Button variant="link" asChild className="p-0 h-auto">
                  <Link
                    href="https://github.com/vutranquangminh"
                    target="_blank"
                  >
                    vutranquangminh
                  </Link>
                </Button>
              </p>
              <p>
                <strong>Email:</strong>{" "}
                <Button variant="link" asChild className="p-0 h-auto">
                  <a href="mailto:vutranquangminh.dev@gmail.com">
                    vutranquangminh.dev@gmail.com
                  </a>
                </Button>
              </p>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-semibold mb-2">
                Lê Nguyên Khang – Co-Founder
              </h3>
              <p>Backend Developer | Specializing in Backend Development</p>
              <p>
                <strong>GitHub:</strong>{" "}
                <Button variant="link" asChild className="p-0 h-auto">
                  <Link href="https://github.com/Rimz1701" target="_blank">
                    Rimz1701
                  </Link>
                </Button>
              </p>
              <p>
                <strong>Email:</strong>{" "}
                <Button variant="link" asChild className="p-0 h-auto">
                  <a href="mailto:emkhang.devlo@gmail.com">
                    emkhang.devlo@gmail.com
                  </a>
                </Button>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-8 bg-gradient-to-r from-blue-900/30 to-indigo-900/30 border-blue-500/40">
        <CardHeader>
          <CardTitle>About this Project</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-base leading-loose">
            This platform was developed as the final-year project at the
            University of Greenwich, showcasing our team&apos;s ability to
            design and implement modern Web3 solutions. The application
            highlights advanced fullstack development skills, with strong
            emphasis on backend reliability, frontend usability, and
            privacy-conscious architecture.
          </p>
          <p className="text-base leading-loose mt-4">
            Although this project was built in an academic setting, it reflects
            professional software engineering practices including modular
            design, secure API integration, and attention to user data
            protection. For real-world deployment, additional steps such as
            industry-grade privacy compliance audits, enhanced security
            hardening, and legal review would be required to ensure the platform
            meets production standards.
          </p>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-center mt-12">
        <div className="flex justify-center gap-6 mt-4">
          <Button variant="link" asChild>
            <Link href="/terms-and-privacy/terms">Terms of Service</Link>
          </Button>
          <Button variant="link" asChild>
            <Link href="/terms-and-privacy/privacy">Privacy Policy</Link>
          </Button>
          <Button variant="link" asChild>
            <Link href="/">Home</Link>
          </Button>
        </div>

        <p className="text-sm">
          © {new Date().getFullYear()} Decode Network. All rights reserved.
        </p>
      </div>
    </>
  );
}
