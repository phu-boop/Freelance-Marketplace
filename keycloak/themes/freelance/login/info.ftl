<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=displayMessage displayInfo=true; section>
    <#if section = "header">
        <h1 class="kc-title">
            <#if messageHeader??>
                ${messageHeader}
            <#else>
                ${message.summary}
            </#if>
        </h1>
    <#elseif section = "form">
        <div id="kc-info-message">
            <p class="instruction">${message.summary}<#if requiredActions??><#list requiredActions>: <b><#items as reqActionItem>${msg("requiredAction.${reqActionItem}")}<#sep>, </#items></b></#list><#else></#if></p>
            
            <#if skipLink??>
            <#else>
                <#if pageRedirectUri??>
                    <p><a href="${pageRedirectUri}" class="kc-button-primary" style="display: block; text-align: center; text-decoration: none;">${msg("backToApplication")}</a></p>
                <#elseif actionUri??>
                    <p><a href="${actionUri}" class="kc-button-primary" style="display: block; text-align: center; text-decoration: none;">${msg("proceedWithAction")}</a></p>
                <#elseif client.baseUrl??>
                    <p><a href="${client.baseUrl}" class="kc-button-primary" style="display: block; text-align: center; text-decoration: none;">${msg("backToApplication")}</a></p>
                </#if>
            </#if>
        </div>
    </#if>
</@layout.registrationLayout>
