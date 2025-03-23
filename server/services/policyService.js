"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPolicy = createPolicy;
const canonicalize_1 = __importDefault(require("canonicalize")); // For JSON canonicalization
const crypto = __importStar(require("crypto")); // For cryptographic operations
import("node-fetch");
// Replace this with your private key from the Dashboard
const PRIVY_AUTHORIZATION_KEY = 'wallet-auth:MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgiNhlIWPT9yr/XRmb3qgssVWSr91E4XX8X62HbPVAMi+hRANCAARx5wcOumvPh0Yweqsum+7NvlQoTC2qL1XoCio+JxBe8nL3fB4KorklityyACRqAdnd7sXoBr414dJbXBB5rBgm';
/**
 * Function to generate the authorization signature
 */
function getAuthorizationSignature({ url, body, }) {
    const payload = {
        version: 1,
        method: 'POST',
        url,
        body,
        headers: {
            'privy-app-id': 'cm6m2x54x009tkqmmiupwl2eg'
            // If your request includes an idempotency key, include that header here as well
        },
    };
    // JSON-canonicalize the payload and convert it to a buffer
    const serializedPayload = (0, canonicalize_1.default)(payload);
    if (!serializedPayload) {
        throw new Error('Failed to canonicalize payload');
    }
    const serializedPayloadBuffer = Buffer.from(serializedPayload);
    // Remove the 'wallet-auth:' prefix from the private key
    const privateKeyAsString = PRIVY_AUTHORIZATION_KEY.replace('wallet-auth:', '');
    // Convert the private key to PEM format
    const privateKeyAsPem = `-----BEGIN PRIVATE KEY-----\n${privateKeyAsString}\n-----END PRIVATE KEY-----`;
    // Instantiate a node crypto KeyObject for the private key
    const privateKey = crypto.createPrivateKey({
        key: privateKeyAsPem,
        format: 'pem',
    });
    // Sign the payload buffer with the private key and serialize the signature to a base64 string
    const signatureBuffer = crypto.sign('sha256', serializedPayloadBuffer, privateKey);
    const signature = signatureBuffer.toString('base64');
    return signature;
}
/**
 * Function to create a policy
 */
async function createPolicy(policy) {
    try {
        // URL for the Privy API
        const url = 'https://api.privy.io/v1/policies';
        // Generate the authorization signature
        const authorizationSignature = getAuthorizationSignature({
            url,
            body: policy,
        });
        // Make the POST request to the Privy API
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${btoa("cm6m2x54x009tkqmmiupwl2eg:5x9hnFZ7NJhVhZkAidxABCfcewb6VQENdtHEZyPvcqwUcwRsEveVfpBc9svYD2i17ZKLKPKCyEk53HEQtV9s59ZU")}`,
                'privy-app-id': 'cm6m2x54x009tkqmmiupwl2eg',
                'privy-authorization-signature': authorizationSignature,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(policy),
        });
        // Parse the response
        const data = await response.json();
        // Check if the request was successful
        if (response.ok) {
            return { success: true, data };
        }
        else {
            return { success: false, error: data.error || 'Failed to create policy' };
        }
    }
    catch (error) {
        console.error('Error creating policy:', error);
        return { success: false, error: 'Internal server error' };
    }
}
// Example usage of the createPolicy function
