package com.example.keycloak23

import org.keycloak.authentication.RequiredActionContext
import org.keycloak.authentication.RequiredActionProvider

class SampleRequiredAction : RequiredActionProvider {
    companion object {
        const val PROVIDER_ID = "sample-required-action"
        const val ATTRIBUTE_NAME = "sample_attribute"
        const val FORM_FIELD = "sampleValue"
    }

    override fun evaluateTriggers(context: RequiredActionContext) {}

    override fun requiredActionChallenge(context: RequiredActionContext) {
        val form = context.form()
        context.challenge(form.createForm("sample-required-action.ftl"))
    }

    override fun processAction(context: RequiredActionContext) {
        val value = context.httpRequest.decodedFormParameters
            .getFirst(FORM_FIELD) ?: ""

        if (value.isBlank()) {
            val form = context.form()
                .setError("value is required")
            context.challenge(form.createForm("sample-required-action.ftl"))
            return
        }

        context.user.setSingleAttribute(ATTRIBUTE_NAME, value)
        context.user.removeRequiredAction(PROVIDER_ID)
        context.success()
    }

    override fun close() {}
}
