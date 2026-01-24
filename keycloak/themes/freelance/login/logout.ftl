<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=false; section>
    <#if section = "header">
        <div class="kc-title">Sign Out</div>
        <div class="kc-subtitle">Are you sure you want to log out?</div>
    <#elseif section = "form">
        <div id="kc-logout-confirm" class="text-center space-y-8">
            <div class="p-8 bg-blue-500/10 rounded-full w-24 h-24 flex items-center justify-center mx-auto border border-blue-500/20">
                <span style="font-size: 40px">👋</span>
            </div>
            
            <p class="instruction text-slate-400 font-medium">${msg("logoutConfirmHeader")}</p>
            
            <form class="form-actions" action="${url.logoutConfirmAction}" method="POST">
                <input type="hidden" name="session_code" value="${logout.code}">
                <div class="space-y-4">
                    <button name="confirmLogout" id="kc-logout" type="submit" class="kc-button-primary">
                        ${msg("doLogout")}
                    </button>
                    <#if logout.logoutRedirectUri?has_content>
                        <a href="${logout.logoutRedirectUri}" class="text-xs text-slate-500 hover:text-white transition-colors">Cancel and Stay</a>
                    </#if>
                </div>
            </form>
        </div>
    </#if>
</@layout.registrationLayout>
