/**
 * Maritime Connectivity Platform Identity Registry API
 * The MCP Identity Registry API can be used for managing entities in the Maritime Connectivity Platform.<br>Two versions of the API are available - one that requires authentication using OpenID Connect and one that requires authentication using a X.509 client certificate.<br>The OpenAPI descriptions for the two versions are available <a href=\"https://test-api.maritimeconnectivity.net/v3/api-docs/mcp-idreg-oidc\">here</a> and <a href=\"https://test-api-x509.maritimeconnectivity.net/v3/api-docs/mcp-idreg-x509\">here</a>.<br>Additionally, a SECOM based API is also available for which the OpenAPI description can be found <a href=\"https://test-api.maritimeconnectivity.net/v3/api-docs/mcp-idreg-secom\">here</a>.
 *
 * OpenAPI spec version: 1.3.0
 * Contact: info@maritimeconnectivity.net
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */

/**
 * Model object representing a role
 */
export interface Role { 
    /**
     * The ID of the entity in the form of a sequential integer
     */
    readonly id?: number;
    /**
     * The time that the entity was created
     */
    readonly createdAt?: Date;
    /**
     * The time that the entity was last updated
     */
    readonly updatedAt?: Date;
    /**
     * The role that should be mapped to the permission
     */
    roleName: Role.RoleNameEnum;
    /**
     * The permission that should be mapped to the role
     */
    permission: string;
    idOrganization?: number;
}
export namespace Role {
    export type RoleNameEnum = 'ROLE_SITE_ADMIN, ROLE_ORG_ADMIN, ROLE_ENTITY_ADMIN,ROLE_USER_ADMIN, ROLE_VESSEL_ADMIN, ROLE_SERVICE_ADMIN, ROLE_DEVICE_ADMIN, ROLE_MMS_ADMIN, ROLE_USER, ROLE_APPROVE_ORG';
    export const RoleNameEnum = {
        ROLESITEADMINROLEORGADMINROLEENTITYADMINROLEUSERADMINROLEVESSELADMINROLESERVICEADMINROLEDEVICEADMINROLEMMSADMINROLEUSERROLEAPPROVEORG: 'ROLE_SITE_ADMIN, ROLE_ORG_ADMIN, ROLE_ENTITY_ADMIN,ROLE_USER_ADMIN, ROLE_VESSEL_ADMIN, ROLE_SERVICE_ADMIN, ROLE_DEVICE_ADMIN, ROLE_MMS_ADMIN, ROLE_USER, ROLE_APPROVE_ORG' as RoleNameEnum
    };
}