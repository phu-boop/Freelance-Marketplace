<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=false; section>
    <#if section = "header">
        <div class="kc-title">Terms & Conditions</div>
        <div class="kc-subtitle">Please review our rules</div>
    <#elseif section = "form">
        <div id="kc-terms-text" class="bg-slate-950/50 p-6 rounded-xl border border-slate-800 h-64 overflow-y-auto mb-8 text-sm text-slate-300 leading-relaxed scrollbar-thin scrollbar-thumb-slate-700">
            ${msg("termsText")?no_esc}
            <#-- Realistic fallback if msg is missing -->
            <p className="mb-4">Welcome to Freelance Marketplace. By using our platform, you agree to:</p>
            <ul className="list-disc pl-5 space-y-2">
                <li>Provide accurate profile information.</li>
                <li>Respect other users and maintain professional conduct.</li>
                <li>Adhere to all local and international laws regarding freelance work.</li>
                <li>Accept our handling of data as described in the Privacy Policy.</li>
            </ul>
        </div>
        
        <form class="form-actions" action="${url.loginAction}" method="POST">
            <div class="grid grid-cols-2 gap-4">
                <button name="cancel" id="kc-decline" type="submit" class="p-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-all font-semibold">
                    ${msg("doDecline")}
                </button>
                <button name="accept" id="kc-accept" type="submit" class="kc-button-primary">
                    ${msg("doAccept")}
                </button>
            </div>
        </form>
    </#if>
</@layout.registrationLayout>
