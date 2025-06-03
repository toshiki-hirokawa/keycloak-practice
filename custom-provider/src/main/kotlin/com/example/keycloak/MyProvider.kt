package com.example.keycloak

import org.keycloak.Config
import org.keycloak.models.KeycloakSession
import org.keycloak.models.KeycloakSessionFactory
import org.keycloak.provider.Provider
import org.keycloak.provider.ProviderFactory

class MyProvider : Provider {
    override fun close() {
        println("MyProvider closed.")
    }
}

class MyProviderFactory : ProviderFactory<MyProvider> {
    override fun create(session: KeycloakSession): MyProvider = MyProvider()
    override fun init(config: Config.Scope?) {}
    override fun postInit(factory: KeycloakSessionFactory?) {}
    override fun close() {}
    override fun getId(): String = "my-kotlin-provider"
}
