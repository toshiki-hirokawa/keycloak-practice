<#import "template.ftl" as layout>
<@layout.registrationLayout displayInfo=false>
    <form action="${url.loginAction}" method="post">
        <div class="form-group">
            <label for="customInput">カスタム入力:</label>
            <input type="text" id="customInput" name="customInput" class="form-control" />
        </div>
        <div class="form-group">
            <button type="submit" class="btn btn-primary">送信</button>
        </div>
    </form>
</@layout.registrationLayout>
