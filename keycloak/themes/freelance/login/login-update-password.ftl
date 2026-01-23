<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=displayMessage; section>
    <#if section = "header">
        <h1 class="kc-title">${msg("updatePasswordTitle")}</h1>
        <p class="kc-subtitle">${msg("updatePasswordInstruction")}</p>
    <#elseif section = "form">
        <form id="kc-passwd-update-form" action="${url.loginAction}" method="post">
            <div class="kc-form-group">
                <label for="password-new">${msg("passwordNew")}</label>
                <input type="password" id="password-new" name="password-new" autocomplete="new-password" autofocus />
            </div>

            <div class="kc-form-group">
                <label for="password-confirm">${msg("passwordConfirm")}</label>
                <input type="password" id="password-confirm" name="password-confirm" autocomplete="new-password" />
            </div>

            <button type="submit" class="kc-button-primary">
                ${msg("doSubmit")}
            </button>
        </form>
    </#if>
</@layout.registrationLayout>
