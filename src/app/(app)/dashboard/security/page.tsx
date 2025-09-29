"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShieldHalved,
  faMobileScreen,
  faLock,
  faEnvelope,
} from "@fortawesome/free-solid-svg-icons";

export default function SecurityPage() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-[color:var(--surface)] border border-[color:var(--border)] rounded-xl p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-lg bg-green-500/15 text-green-600 dark:text-green-400 flex items-center justify-center">
            <FontAwesomeIcon icon={faShieldHalved} />
          </div>
          <div>
            <h3 className="font-semibold text-[color:var(--foreground)]">
              2‑Step Verification
            </h3>
            <p className="text-xs text-[color:var(--muted-foreground)]">
              Add an extra layer of security to your account
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between bg-[color:var(--surface-muted)] border border-[color:var(--border)] rounded-lg p-4">
          <div className="flex items-center gap-3">
            <FontAwesomeIcon
              icon={faMobileScreen}
              className="text-blue-600 dark:text-blue-400"
            />
            <div>
              <p className="text-sm text-[color:var(--foreground)]">
                Authenticator App
              </p>
              <p className="text-xs text-[color:var(--muted-foreground)]">
                Last verified 3 days ago
              </p>
            </div>
          </div>
          <span className="text-green-600 dark:text-green-400 text-sm">
            Enabled
          </span>
        </div>
      </div>

      <div className="bg-[color:var(--surface)] border border-[color:var(--border)] rounded-xl p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <FontAwesomeIcon icon={faLock} />
          </div>
          <div>
            <h3 className="font-semibold text-[color:var(--foreground)]">
              Password
            </h3>
            <p className="text-xs text-[color:var(--muted-foreground)]">
              A strong password helps keep your account safe
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between bg-[color:var(--surface-muted)] border border-[color:var(--border)] rounded-lg p-4">
          <p className="text-sm text-[color:var(--foreground)]">
            Last changed: 2 months ago
          </p>
          <button className="text-sm text-blue-600 dark:text-blue-400 hover:opacity-80">
            Change
          </button>
        </div>
      </div>

      <div className="bg-[color:var(--surface)] border border-[color:var(--border)] rounded-xl p-5 lg:col-span-2">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-lg bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <FontAwesomeIcon icon={faEnvelope} />
          </div>
          <div>
            <h3 className="font-semibold text-[color:var(--foreground)]">
              Recovery email
            </h3>
            <p className="text-xs text-[color:var(--muted-foreground)]">
              Use this email to recover your account
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between bg-[color:var(--surface-muted)] border border-[color:var(--border)] rounded-lg p-4">
          <p className="text-sm text-[color:var(--foreground)]">
            john.doe@example.com
          </p>
          <button className="text-sm text-blue-600 dark:text-blue-400 hover:opacity-80">
            Edit
          </button>
        </div>
      </div>
    </div>
  );
}
