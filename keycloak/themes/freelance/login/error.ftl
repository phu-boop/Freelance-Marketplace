<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=false; section>
    <#if section = "header">
        <div class="kc-title">Oops!</div>
        <div class="kc-subtitle">Something went wrong</div>
    <#elseif section = "form">
        <div id="kc-error-message" class="text-center space-y-6">
            <div class="p-8 bg-red-500/10 rounded-full w-24 h-24 flex items-center justify-center mx-auto border border-red-500/20">
                <span style="font-size: 40px">⚠️</span>
            </div>
            
            <p class="instruction text-red-400 font-medium">${message.summary?no_esc}</p>
            
            <#if client?? && client.baseUrl?has_content>
                <p><a id="backToApplication" href="${client.baseUrl}" class="kc-button-primary" style="text-decoration: none">Back to Application</a></p>
            </#if>
        </div>
    </#if>
</@layout.registrationLayout>
