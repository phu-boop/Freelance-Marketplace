import { KeycloakProvider } from "@/components/KeycloakProvider";
import { UserProvider } from "@/components/UserContext";
import { CurrencyProvider } from "@/components/CurrencyProvider";
import { LanguageProvider } from "@/components/LanguageProvider";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import { Toaster } from "sonner";
import React from "react";

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <KeycloakProvider>
            <UserProvider>
                <LanguageProvider>
                    <CurrencyProvider>
                        <ServiceWorkerRegistration />
                        {children}
                        <Toaster />
                    </CurrencyProvider>
                </LanguageProvider>
            </UserProvider>
        </KeycloakProvider>
    );
}
