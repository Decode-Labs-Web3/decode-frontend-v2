import { Metadata } from "next";
import Legal from "@/components/(legal)";

export const metadata: Metadata = {
  title: "Privacy Policy - Decode Network",
  description:
    "Privacy Policy for Decode Network - Web3 Authentication and Identity Management Platform",
};

export default function PrivacyPage() {
  const personalInfo = [
    "Username, email address, password (encrypted)",
    "Display name, bio, avatar, and other profile details",
    "Email address for communications and notifications",
    "Device fingerprints, login patterns, and security information",
  ];

  const web3Info = [
    "Public blockchain addresses associated with your account",
    "Public transaction information from connected wallets",
    "Blockchain networks you interact with",
    "Information about digital assets in your wallets",
  ];

  const technicalInfo = [
    "Device type, operating system, browser type and version",
    "How you interact with our Service, pages visited, features used",
    "IP address, access times, error logs, and performance data",
    "Information stored in cookies and similar technologies",
  ];

  const serviceProvision = [
    "Provide, maintain, and improve our Service",
    "Process transactions and manage your account",
    "Enable Web3 wallet integration and blockchain interactions",
    "Facilitate communication between users",
  ];

  const securityAuth = [
    "Verify your identity and authenticate your account",
    "Detect and prevent fraud, abuse, and security threats",
    "Monitor for suspicious activity and unauthorized access",
    "Implement device trust and security measures",
  ];

  const serviceProviders = [
    "Cloud hosting and infrastructure providers",
    "Email and communication services",
    "Analytics and monitoring services",
    "IPFS and decentralized storage providers (Pinata)",
    "Blockchain infrastructure providers",
  ];

  const securityMeasures = [
    "Data is encrypted in transit and at rest using industry-standard protocols",
    "Strict access controls and authentication requirements",
    "Regular security assessments and vulnerability testing",
    "Hosting on secure, monitored infrastructure",
    "Regular security training for all team members",
  ];

  const userRights = [
    "Request access to your personal information",
    "Request correction of inaccurate or incomplete information",
    "Request deletion of your personal information",
    "Request a copy of your data in a portable format",
    "Request restriction of processing of your information",
    "Object to certain types of processing",
  ];

  return (
    <Legal.LegalPageLayout title="Privacy Policy">
      {/* Introduction */}
      <Legal.LegalContent title="1. Introduction">
        <p className=" leading-relaxed mb-4">
          At Decode Network (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or
          &ldquo;us&rdquo;), we are committed to protecting your privacy and
          personal information. This Privacy Policy explains how we collect,
          use, disclose, and safeguard your information when you use our hybrid
          Web2 + Web3 ecosystem platform and related services (collectively, the
          &ldquo;Service&rdquo;).
        </p>
        <p className=" leading-relaxed">
          This Privacy Policy applies to all users of our Service, including
          those who access our platform through traditional authentication
          methods or Web3 wallet connections.
        </p>
      </Legal.LegalContent>

      {/* Information We Collect */}
      <Legal.LegalContent title="2. Information We Collect">
        <div className="space-y-6">
          <Legal.LegalContent title="2.1 Personal Information" isSubSection>
            <div className="space-y-2">
              {personalInfo.map((info, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <strong>
                      {index === 0 && "Account Information:"}
                      {index === 1 && "Profile Information:"}
                      {index === 2 && "Contact Information:"}
                      {index === 3 && "Authentication Data:"}
                    </strong>
                    <span className="ml-2">{info}</span>
                  </div>
                </div>
              ))}
            </div>
          </Legal.LegalContent>

          <Legal.LegalContent
            title="2.2 Web3 and Blockchain Information"
            isSubSection
          >
            <div className="space-y-2">
              {web3Info.map((info, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <strong>
                      {index === 0 && "Wallet Addresses:"}
                      {index === 1 && "Transaction Data:"}
                      {index === 2 && "Network Information:"}
                      {index === 3 && "NFT and Token Data:"}
                    </strong>
                    <span className="ml-2">{info}</span>
                  </div>
                </div>
              ))}
            </div>
          </Legal.LegalContent>
        </div>

        <div className="mt-6">
          <Legal.LegalContent title="2.3 Technical Information" isSubSection>
            <div className="space-y-2">
              {technicalInfo.map((info, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <strong>
                      {index === 0 && "Device Information:"}
                      {index === 1 && "Usage Data:"}
                      {index === 2 && "Log Data:"}
                      {index === 3 && "Cookies and Tracking:"}
                    </strong>
                    <span className="ml-2">{info}</span>
                  </div>
                </div>
              ))}
            </div>
          </Legal.LegalContent>
        </div>
      </Legal.LegalContent>

      {/* How We Use Information */}
      <Legal.LegalContent title="3. How We Use Your Information">
        <div className="space-y-6">
          <Legal.LegalContent title="3.1 Service Provision" isSubSection>
            <Legal.LegalContent title="" items={serviceProvision} />
          </Legal.LegalContent>

          <Legal.LegalContent title="3.2 Security and Authentication" isSubSection>
            <Legal.LegalContent title="" items={securityAuth} />
          </Legal.LegalContent>
        </div>
      </Legal.LegalContent>

      {/* Information Sharing */}
      <Legal.LegalContent title="4. Information Sharing and Disclosure">
        <p className=" leading-relaxed mb-4">
          We do not sell, trade, or rent your personal information to third
          parties. We may share your information in the following limited
          circumstances:
        </p>
        <div className="space-y-4">
          <Legal.LegalContent title="4.1 With Your Consent" isSubSection>
            <p className=" leading-relaxed">
              We may share your information when you explicitly consent to such
              sharing, such as when you choose to connect your account with
              third-party services.
            </p>
          </Legal.LegalContent>

          <Legal.LegalContent title="4.2 Service Providers" isSubSection>
            <p className=" leading-relaxed mb-4">
              We may share information with trusted third-party service
              providers who assist us in operating our Service, including:
            </p>
            <Legal.LegalContent title="" items={serviceProviders} />
          </Legal.LegalContent>
        </div>
      </Legal.LegalContent>

      {/* Data Security */}
      <Legal.LegalContent title="5. Data Security">
        <p className=" leading-relaxed mb-4">
          We implement appropriate technical and organizational security
          measures to protect your personal information against unauthorized
          access, alteration, disclosure, or destruction. These measures
          include:
        </p>
        <Legal.LegalContent title="" items={securityMeasures} />
        <p className=" leading-relaxed mt-4">
          However, no method of transmission over the internet or electronic
          storage is 100% secure. While we strive to protect your information,
          we cannot guarantee absolute security.
        </p>
      </Legal.LegalContent>

      {/* Your Rights */}
      <Legal.LegalContent title="6. Your Rights and Choices">
        <p className=" leading-relaxed mb-4">
          Depending on your jurisdiction, you may have the following rights
          regarding your personal information:
        </p>
        <Legal.LegalContent title="" items={userRights} />
        <p className=" leading-relaxed mt-4">
          To exercise these rights, please contact us using the information
          provided in the Contact section below.
        </p>
      </Legal.LegalContent>

      <Legal.LegalInfoCard />
    </Legal.LegalPageLayout>
  );
}
