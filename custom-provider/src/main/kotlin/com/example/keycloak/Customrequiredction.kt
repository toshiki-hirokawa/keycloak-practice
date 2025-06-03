package com.example.keycloak

import org.keycloak.authentication.RequiredActionContext
import org.keycloak.authentication.RequiredActionFactory
import org.keycloak.authentication.RequiredActionProvider
import org.keycloak.models.KeycloakSession
import org.keycloak.provider.ProviderConfigProperty
import org.keycloak.sessions.AuthenticationSessionModel

class CustomRequiredAction : RequiredActionProvider {
    override fun evaluateTriggers(context: RequiredActionContext?) {
        // 特定条件でこのアクションを追加したい場合に使う（なければ空でOK）
    }

    override fun requiredActionChallenge(context: RequiredActionContext) {
        val form = context.form()
        context.challenge(form.createForm("custom-required-action.ftl"))
    }


    override fun processAction(context: RequiredActionContext?) {
        context?.success()
    }

    override fun close() {}
}

class CustomRequiredActionFactory : RequiredActionFactory {
    override fun getDisplayText(): String = "My Custom Action"

    override fun getId(): String = "custom-required-action"

    override fun create(session: KeycloakSession): RequiredActionProvider {
        return CustomRequiredAction()
    }

    override fun init(config: org.keycloak.Config.Scope?) {}
    override fun postInit(factory: org.keycloak.models.KeycloakSessionFactory?) {}
    override fun close() {}
}
