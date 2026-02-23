<#macro registrationLayout displayMessage=true displayInfo=false displayRequiredFields=false showAnotherWayIfPresent=true bodyClass="" displayWide=false>
<!DOCTYPE html>
<html lang="${(locale.currentLanguageTag)!'en'}">
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
  <div class="split-screen-container">
    <#-- Left Column: Branding -->
    <div class="branding-column">
        <div class="branding-content">
            <h1 class="branding-title">Thuê qua <span class="brand-highlight">Fastlance</span></h1>
            <h2 class="branding-subtitle">Bảo vệ thanh toán, bảo đảm công việc</h2>
            
            <div class="branding-illustration">
                <div class="illustration-flow">
                    <div class="flow-step">
                        <div class="step-circle user-circle">
                            <span class="user-icon">👤</span>
                        </div>
                        <span class="step-label">Người thuê</span>
                    </div>
                    <div class="flow-arrow">
                        <span class="arrow-text-top">Đã chọn freelancer</span>
                        <div class="arrow-line">----------------></div>
                    </div>
                    <div class="flow-center">
                        <div class="center-circle">
                            <span class="brand-logo">Fastlance</span>
                        </div>
                    </div>
                    <div class="flow-arrow">
                        <span class="arrow-text-top">Tăng thu nhập</span>
                        <div class="arrow-line">----------------></div>
                    </div>
                    <div class="flow-step">
                        <div class="step-circle freelancer-circle">
                            <span class="freelancer-icon">👨‍💻</span>
                        </div>
                        <span class="step-label">Freelancer</span>
                    </div>
                </div>
            </div>

            <div class="branding-features">
                <div class="feature-item">
                    <span class="feature-icon">🛡️</span>
                    <span class="feature-text">Bảo đảm thanh toán</span>
                </div>
                <div class="feature-item">
                    <span class="feature-icon">📜</span>
                    <span class="feature-text">Có chứng chỉ hành nghề</span>
                </div>
                <div class="feature-item">
                    <span class="feature-icon">🤝</span>
                    <span class="feature-text">Cam kết hoàn tiền nếu vi phạm thỏa thuận</span>
                </div>
                <div class="feature-item">
                    <span class="feature-icon">🎧</span>
                    <span class="feature-text">Hỗ trợ trong suốt quá trình tuyển dụng</span>
                </div>
                <div class="feature-item">
                    <span class="feature-icon">✅</span>
                    <span class="feature-text">Freelancer đã xác minh</span>
                </div>
            </div>
        </div>
    </div>

    <#-- Right Column: Login Form -->
    <div class="login-column">
        <div class="kc-login-card">
            <h2 class="login-title">Đăng nhập / Tạo tài khoản</h2>
            
            <div class="kc-content">
                <#-- Added Message Rendering Block -->
                <#if displayMessage && message?has_content && (message.type != 'warning' || !isAppInitiatedAction??)>
                    <div class="alert-${message.type} kc-feedback">
                        <span class="kc-feedback-text">${kcSanitize(message.summary)?no_esc}</span>
                    </div>
                </#if>
                <#nested "form">
            </div>

            <#if displayInfo>
                <div class="kc-info-wrapper">
                    <#nested "info">
                </div>
            </#if>
        </div>
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
