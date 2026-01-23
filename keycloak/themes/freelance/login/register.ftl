<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=displayMessage; section>
    <#if section = "header">
        <h1 class="kc-title">${msg("registerTitle")}</h1>
        <p class="kc-subtitle">${msg("registerWelcomeMessage")}</p>
    <#elseif section = "form">
        <form id="kc-register-form" action="${url.registrationAction}" method="post">
            <div class="kc-form-group">
                <label for="firstName">${msg("firstName")}</label>
                <input type="text" id="firstName" name="firstName" value="${(register.formData.firstName!'')}" />
            </div>

            <div class="kc-form-group">
                <label for="lastName">${msg("lastName")}</label>
                <input type="text" id="lastName" name="lastName" value="${(register.formData.lastName!'')}" />
            </div>

            <div class="kc-form-group">
                <label for="email">${msg("email")}</label>
                <input type="text" id="email" name="email" value="${(register.formData.email!'')}" autocomplete="email" />
            </div>

            <#if !realm.registrationEmailAsUsername>
                <div class="kc-form-group">
                    <label for="username">${msg("username")}</label>
                    <input type="text" id="username" name="username" value="${(register.formData.username!'')}" autocomplete="username" />
                </div>
            </#if>

            <#if passwordRequired??>
                <div class="kc-form-group">
                    <label for="password">${msg("password")}</label>
                    <input type="password" id="password" name="password" autocomplete="new-password" />
                </div>

                <div class="kc-form-group">
                    <label for="password-confirm">${msg("passwordConfirm")}</label>
                    <input type="password" id="password-confirm" name="password-confirm" />
                </div>
            </#if>

            <#if recaptchaRequired??>
                <div class="form-group">
                    <div class="g-recaptcha" data-size="compact" data-sitekey="${recaptchaSiteKey}"></div>
                </div>
            </#if>

            <button type="submit" class="kc-button-primary">
                ${msg("doRegister")}
            </button>
        </form>
    <#elseif section = "footer">
        <p>
            ${msg("alreadyHaveAccount")}
            <a href="${url.loginUrl}">${kcSanitize(msg("backToLogin"))?no_esc}</a>
        </p>
    </#if>
</@layout.registrationLayout>
