import { Metadata } from "next";
import Legal from "@/components/(legal)";

export const metadata: Metadata = {
  title: "Terms of Service - Decode Network",
  description:
    "Terms of Service for Decode Network - Web3 Authentication and Identity Management Platform",
};

export default function TermsPage() {
  const lastUpdated = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const ecosystemComponents = [
    "Job and contribution platform for Web3 talent",
    "Crowdfunding platform with milestone-based smart contracts",
    "Secure messaging platform with end-to-end encryption",
    "Identity and reputation hub connecting on-chain behavior",
    "NFT marketplace for creators",
    "DEX and DeFi staking hub for $DCT token",
    "Learn-to-Earn platform for Web3 education",
    "Governance layer for community decision-making",
  ];

  const ecosystemNames = [
    "DeCareer",
    "DeFuel",
    "DeHive",
    "DeTrust",
    "DeGallery",
    "DeSwap",
    "DeCourse",
    "DeDAO",
  ];

  const walletAcknowledgment = [
    "You control the private keys associated with your wallet",
    "We do not store your private keys or seed phrases",
    "You are responsible for the security of your wallet",
    "Transactions initiated through our platform are irreversible",
  ];

  const acceptableUseRestrictions = [
    "Violate any applicable laws or regulations",
    "Infringe upon the rights of others",
    "Transmit or distribute malicious code, viruses, or harmful content",
    "Attempt to gain unauthorized access to our systems or other users' accounts",
    "Use the Service for any fraudulent or deceptive purpose",
    "Interfere with or disrupt the Service or servers connected to the Service",
    "Engage in any activity that could harm or compromise the security of the platform",
    "Use automated systems to access the Service without permission",
  ];

  const blockchainRisks = [
    "Volatility and unpredictability of cryptocurrency values",
    "Risk of loss due to technical failures or security breaches",
    "Regulatory changes that may affect blockchain technology",
    "Irreversible nature of blockchain transactions",
  ];

  return (
    <Legal.LegalPageLayout title="Terms of Service" lastUpdated={lastUpdated}>
      {/* Introduction */}
      <Legal.LegalContent title="1. Introduction">
        <p className="leading-relaxed mb-4">
          Welcome to Decode Network (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or
          &ldquo;us&rdquo;). These Terms of Service (&ldquo;Terms&rdquo;) govern
          your use of our hybrid Web2 + Web3 ecosystem platform, including our
          authentication system, identity management services, and all related
          applications, websites, and services (collectively, the
          &ldquo;Service&rdquo;).
        </p>
        <p className="leading-relaxed">
          By accessing or using our Service, you agree to be bound by these
          Terms. If you disagree with any part of these terms, you may not
          access the Service.
        </p>
      </Legal.LegalContent>

      {/* Acceptance of Terms */}
      <Legal.LegalContent title="2. Acceptance of Terms">
        <p className=" leading-relaxed">
          By creating an account, connecting your Web3 wallet, or using any part
          of our Service, you acknowledge that you have read, understood, and
          agree to be bound by these Terms and our Privacy Policy. These Terms
          constitute a legally binding agreement between you and Decode Network.
        </p>
      </Legal.LegalContent>

      {/* Description of Service */}
      <Legal.LegalContent title="3. Description of Service">
        <p className=" leading-relaxed mb-4">
          Decode Network is a comprehensive Web3 ecosystem that includes:
        </p>
        <div className="space-y-3">
          {ecosystemComponents.map((component, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <strong>{ecosystemNames[index]}:</strong>
                <span className="ml-2">{component}</span>
              </div>
            </div>
          ))}
        </div>
      </Legal.LegalContent>

      {/* User Accounts */}
      <Legal.LegalContent title="4. User Accounts and Authentication">
        <div className="space-y-6">
          <Legal.LegalContent title="4.1 Account Creation" isSubSection>
            <p className=" leading-relaxed">
              You may create an account using traditional email/password
              authentication or by connecting your Web3 wallet. You are
              responsible for maintaining the confidentiality of your account
              credentials and for all activities that occur under your account.
            </p>
          </Legal.LegalContent>

          <Legal.LegalContent title="4.2 Web3 Wallet Integration" isSubSection>
            <p className=" leading-relaxed mb-4">
              When connecting your Web3 wallet, you acknowledge that:
            </p>
            <Legal.LegalContent title="" items={walletAcknowledgment} />
          </Legal.LegalContent>

          <Legal.LegalContent title="4.3 Account Security" isSubSection>
            <p className=" leading-relaxed">
              You must immediately notify us of any unauthorized use of your
              account or any other breach of security. We are not liable for any
              loss or damage arising from your failure to comply with this
              security obligation.
            </p>
          </Legal.LegalContent>
        </div>
      </Legal.LegalContent>

      {/* Acceptable Use */}
      <Legal.LegalContent title="5. Acceptable Use Policy">
        <p className=" leading-relaxed mb-4">
          You agree to use our Service only for lawful purposes and in
          accordance with these Terms. You agree not to:
        </p>
        <Legal.LegalContent title="" items={acceptableUseRestrictions} />
      </Legal.LegalContent>

      {/* Intellectual Property */}
      <Legal.LegalContent title="6. Intellectual Property Rights">
        <div className="space-y-6">
          <Legal.LegalContent title="6.1 Our Rights" isSubSection>
            <p className=" leading-relaxed">
              The Service and its original content, features, and functionality
              are owned by Decode Network and are protected by international
              copyright, trademark, patent, trade secret, and other intellectual
              property laws.
            </p>
          </Legal.LegalContent>

          <Legal.LegalContent title="6.2 Your Content" isSubSection>
            <p className=" leading-relaxed">
              You retain ownership of any content you create, upload, or share
              through our Service. By using our Service, you grant us a
              non-exclusive, worldwide, royalty-free license to use, display,
              and distribute your content as necessary to provide the Service.
            </p>
          </Legal.LegalContent>

          <Legal.LegalContent title="6.3 NFTs and Digital Assets" isSubSection>
            <p className=" leading-relaxed">
              Ownership of NFTs and other digital assets created or traded
              through our platform is governed by the underlying smart contracts
              and blockchain technology. We do not claim ownership of your
              digital assets.
            </p>
          </Legal.LegalContent>
        </div>
      </Legal.LegalContent>

      {/* Privacy and Data */}
      <Legal.LegalContent title="7. Privacy and Data Protection">
        <p className=" leading-relaxed mb-4">
          Your privacy is important to us. Our collection and use of personal
          information is governed by our Privacy Policy, which is incorporated
          into these Terms by reference.
        </p>
        <p className=" leading-relaxed">
          We implement appropriate security measures to protect your personal
          information and use industry-standard encryption for data transmission
          and storage.
        </p>
      </Legal.LegalContent>

      {/* Blockchain and Cryptocurrency */}
      <Legal.LegalContent title="8. Blockchain Technology and Cryptocurrency">
        <div className="space-y-6">
          <Legal.LegalContent title="8.1 Blockchain Risks" isSubSection>
            <p className=" leading-relaxed mb-4">
              Our Service utilizes blockchain technology, which involves
              inherent risks including but not limited to:
            </p>
            <Legal.LegalContent title="" items={blockchainRisks} />
          </Legal.LegalContent>

          <Legal.LegalContent title="8.2 No Financial Advice" isSubSection>
            <p className=" leading-relaxed">
              Nothing in our Service constitutes financial, investment, or
              trading advice. You should conduct your own research and consult
              with qualified professionals before making any financial
              decisions.
            </p>
          </Legal.LegalContent>
        </div>
      </Legal.LegalContent>

      {/* Disclaimers */}
      <Legal.LegalContent title="9. Disclaimers and Limitations of Liability">
        <div className="space-y-6">
          <Legal.LegalContent title="9.1 Service Availability" isSubSection>
            <p className=" leading-relaxed">
              We strive to maintain the availability of our Service but do not
              guarantee uninterrupted access. The Service may be temporarily
              unavailable due to maintenance, updates, or technical issues.
            </p>
          </Legal.LegalContent>

          <Legal.LegalContent title="9.2 Limitation of Liability" isSubSection>
            <p className=" leading-relaxed">
              To the maximum extent permitted by law, Decode Network shall not
              be liable for any indirect, incidental, special, consequential, or
              punitive damages, including but not limited to loss of profits,
              data, or other intangible losses resulting from your use of the
              Service.
            </p>
          </Legal.LegalContent>

          <Legal.LegalContent title="9.3 Third-Party Services" isSubSection>
            <p className=" leading-relaxed">
              Our Service may integrate with third-party services and platforms.
              We are not responsible for the availability, content, or practices
              of these third-party services.
            </p>
          </Legal.LegalContent>
        </div>
      </Legal.LegalContent>

      {/* Contact Information, Academic Notice, and Footer */}
      <Legal.LegalInfoCard />
    </Legal.LegalPageLayout>
  );
}
