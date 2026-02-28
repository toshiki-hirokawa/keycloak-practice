package com.example.keycloak23

import org.keycloak.authentication.RequiredActionContext
import org.keycloak.authentication.RequiredActionFactory
import org.keycloak.authentication.RequiredActionProvider
import org.keycloak.models.KeycloakSession

class SampleRequiredActionFactory : RequiredActionFactory {
    override fun getId(): String = SampleRequiredAction.PROVIDER_ID
    override fun getDisplayText(): String = "Sample Required Action"
    override fun create(session: KeycloakSession): RequiredActionProvider =
        SampleRequiredAction()
    override fun init(config: org.keycloak.Config.Scope) {}
    override fun postInit(factory: org.keycloak.models.KeycloakSessionFactory) {}
    override fun close() {}
}
