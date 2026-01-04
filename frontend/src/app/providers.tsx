"use client";

import { KeycloakProvider } from "@/components/KeycloakProvider";
import { CurrencyProvider } from "@/components/CurrencyProvider";
import React from "react";

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <KeycloakProvider>
            <CurrencyProvider>
                {children}
            </CurrencyProvider>
        </KeycloakProvider>
    );
}
