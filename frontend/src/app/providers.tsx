"use client";

import { KeycloakProvider } from "@/components/KeycloakProvider";
import { CurrencyProvider } from "@/components/CurrencyProvider";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import React from "react";

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <KeycloakProvider>
            <CurrencyProvider>
                <ServiceWorkerRegistration />
                {children}
            </CurrencyProvider>
        </KeycloakProvider>
    );
}
