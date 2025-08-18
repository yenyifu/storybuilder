"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

type ProviderState = {
  google: boolean;
  email: boolean;
};

export default function OAuthButtons({
  className = "",
}: {
  className?: string;
}) {
  const { toast } = useToast();
  const [providers, setProviders] = useState<ProviderState | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/auth/providers")
      .then((r) => r.json())
      .then((data: ProviderState) => {
        if (active) setProviders(data);
      })
      .catch(() => {
        // If the check fails, keep buttons disabled to avoid broken redirects.
        setProviders({ google: false, email: true });
      });
    return () => {
      active = false;
    };
  }, []);

  function notConfigured(name: string) {
    toast({
      title: name + " not configured",
      description:
        "Add provider credentials in your environment to enable this sign-in.",
    });
  }

  const disabled = !providers;

  return (
    <div className={className}>
      <div className="space-y-3">
        <Button
          type="button"
          variant="outline"
          className="w-full h-11 justify-start gap-3 bg-transparent"
          disabled={disabled || !providers?.google}
          onClick={() =>
            providers?.google
              ? signIn("google", { callbackUrl: "/dashboard" })
              : notConfigured("Google")
          }
        >
          <span className="text-lg font-bold text-blue-600">G</span>
          <span>Continue with Google</span>
        </Button>
      </div>
    </div>
  );
}
