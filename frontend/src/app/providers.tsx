"use client";

import { KeycloakProvider } from "@/components/KeycloakProvider";
import React from "react";

export default function Providers({ children }: { children: React.ReactNode }) {
    return <KeycloakProvider>{children}</KeycloakProvider>;
}
