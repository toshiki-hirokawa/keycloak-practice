FROM quay.io/keycloak/keycloak:23.0.7

COPY custom-provider/target/custom-provider-1.0.0.jar /opt/keycloak/providers/
COPY custom-provider/src/main/resources/theme/my-theme /opt/keycloak/themes/my-theme


RUN /opt/keycloak/bin/kc.sh build
