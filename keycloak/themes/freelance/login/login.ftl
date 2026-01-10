<#import "template.ftl" as layout>

<@layout.registrationLayout displayMessage=displayMessage; section>
  <#if section = "header">
    <h1 class="kc-title">Welcome back</h1>
    <p class="kc-subtitle">Sign in to your account to continue</p>
  
  <#elseif section = "form">
    <form id="kc-form-login" action="${url.loginAction}" method="post">
      <div class="kc-form-group">
        <label for="username">Email Address</label>
        <input id="username" name="username" type="text" autofocus autocomplete="username" placeholder="name@example.com" value="${(login.username!'')}" />
      </div>

      <div class="kc-form-group">
        <label for="password">Password</label>
        <input id="password" name="password" type="password" autocomplete="current-password" placeholder="••••••••" />
      </div>

      <div class="kc-form-options">
        <#if realm.rememberMe && !login.rememberMe??>
          <label class="kc-checkbox">
            <input type="checkbox" name="rememberMe" id="rememberMe" <#if login.rememberMe??>checked</#if> />
            <span>Remember me</span>
          </label>
        </#if>
        
        <#if realm.resetPasswordAllowed>
          <a href="${url.loginResetCredentialsUrl}" class="kc-forgot-password">Forgot password?</a>
        </#if>
      </div>

      <button type="submit" class="kc-button-primary">
        Sign In
      </button>
    </form>

    <#if socialProviders?? && socialProviders?size gt 0>
      <div class="kc-social-divider">
        <span>Or continue with</span>
      </div>

      <div class="kc-social-providers">
        <#list socialProviders as provider>
          <a href="${provider.loginUrl}" id="social-${provider.alias}" class="kc-social-${provider.alias}">
            <#if provider.alias = "google">Google
            <#elseif provider.alias = "github">Github
            <#elseif provider.alias = "facebook">Facebook
            <#else>${provider.displayName}
            </#if>
          </a>
        </#list>
      </div>
    </#if>

  <#elseif section = "footer">
    <#if realm.password && realm.registrationAllowed && !registrationDisabled??>
        <p>
            Don't have an account? 
            <a href="${url.registrationUrl}">Create one</a>
        </p>
    </#if>
  </#if>
</@layout.registrationLayout>
