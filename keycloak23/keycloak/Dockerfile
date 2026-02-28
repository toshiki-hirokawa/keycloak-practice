FROM quay.io/keycloak/keycloak:23.0.7

COPY ./keycloak/keycloak-providers/custom-provider/target/keycloak-custom-provider.jar /opt/keycloak/providers/
COPY ./keycloak/keycloak-providers/custom-theme/target/keycloak-custom-theme.jar /opt/keycloak/providers/

RUN /opt/keycloak/bin/kc.sh build
