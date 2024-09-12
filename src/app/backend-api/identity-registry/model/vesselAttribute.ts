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
 * Model object representing a vessel attribute
 */
export interface VesselAttribute { 
    /**
     * The time that the entity was created
     */
    readonly createdAt?: Date;
    /**
     * The time that the entity was last updated
     */
    readonly updatedAt?: Date;
    /**
     * Vessel attribute name
     */
    attributeName: VesselAttribute.AttributeNameEnum;
    /**
     * Vessel attribute value
     */
    attributeValue: string;
    /**
     * When the attribute is valid from
     */
    start?: Date;
    /**
     * When the attribute is valid until
     */
    end?: Date;
}
export namespace VesselAttribute {
    export type AttributeNameEnum = 'imo-number' | 'mmsi-number' | 'callsign' | 'flagstate' | 'ais-class' | 'port-of-register';
    export const AttributeNameEnum = {
        ImoNumber: 'imo-number' as AttributeNameEnum,
        MmsiNumber: 'mmsi-number' as AttributeNameEnum,
        Callsign: 'callsign' as AttributeNameEnum,
        Flagstate: 'flagstate' as AttributeNameEnum,
        AisClass: 'ais-class' as AttributeNameEnum,
        PortOfRegister: 'port-of-register' as AttributeNameEnum
    };
}