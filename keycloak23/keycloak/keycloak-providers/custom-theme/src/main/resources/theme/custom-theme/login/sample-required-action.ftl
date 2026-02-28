<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=true; section>
    <#if section = "header">
        Sample Required Action
    <#elseif section = "form">
        <form action="${url.loginAction}" method="post">
            <div class="form-group">
                <label for="sampleValue">入力値</label>
                <input type="text"
                       id="sampleValue"
                       name="sampleValue"
                       class="form-control"
                       autofocus/>
            </div>
            <div class="form-group">
                <input type="submit" value="送信" class="btn btn-primary btn-block"/>
            </div>
        </form>
    </#if>
</@layout.registrationLayout>
