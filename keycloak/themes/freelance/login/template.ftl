<#-- template.ftl – macro registrationLayout used by keycloak templates -->
<#macro registrationLayout displayMessage=displayMessage!false displayInfo=displayInfo!false locale=(locale!"en")>
<!DOCTYPE html>
<html lang="${locale?replace('_','-')}">
<head>
  <meta charset="UTF-8" />
  <title>${msg("loginTitle", (realm.displayName!"Freelance Marketplace"))}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <#if styles??>
    <#if styles?is_sequence>
        <#list styles as style>
            ${style?no_esc}
        </#list>
    <#else>
        ${styles?no_esc}
    </#if>
  </#if>
  <link rel="stylesheet" href="${url.resourcesPath}/css/login.css" />
  <#if themeResources??>
    <#if themeResources?is_sequence>
        <#list themeResources as resource>
            ${resource?no_esc}
        </#list>
    <#else>
        ${themeResources?no_esc}
    </#if>
  </#if>
</head>
<body>
  <div class="kc-login-wrapper">
    <#-- App Header -->
    <div class="kc-header">
       <#nested "header">
    </div>

    <#-- Card Container -->
    <div class="kc-card">
        <#-- Message area (errors, info) -->
        <#if displayMessage && message?has_content && (message.type != 'warning' || !isAppInitiatedAction??)>
            <div class="kc-message-wrapper">
                <div class="kc-feedback alert-${message.type}">
                    <span class="kc-feedback-text">${kcSanitize(message.summary)?no_esc}</span>
                </div>
            </div>
        </#if>

        <#-- Main content injected by login.ftl, etc. -->
        <div class="kc-content">
            <#nested "form">
        </div>

        <#-- Extra info area -->
        <#if displayInfo>
            <div class="kc-info-wrapper">
                <#nested "info">
            </div>
        </#if>
    </div>

    <#-- Footer area -->
    <div class="kc-footer">
       <#nested "footer">
    </div>
  </div>
  
  <#if scripts??>
    <#if scripts?is_sequence>
        <#list scripts as script>
            ${script?no_esc}
        </#list>
    <#else>
        ${scripts?no_esc}
    </#if>
  </#if>
  <script src="${url.resourcesPath}/js/theme.js"></script>
</body>
</html>
</#macro>
