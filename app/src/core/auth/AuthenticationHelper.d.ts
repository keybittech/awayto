export default class AuthenticationHelper {
    constructor(PoolName: any);
    N: BigInteger;
    g: BigInteger;
    k: BigInteger;
    smallAValue: BigInteger;
    infoBits: Buffer;
    poolName: any;
    /**
     * @returns {BigInteger} small A, a random number
     */
    getSmallAValue(): BigInteger;
    /**
     * @param {nodeCallback<BigInteger>} callback Called with (err, largeAValue)
     * @returns {void}
     */
    getLargeAValue(callback: any): void;
    largeAValue: any;
    /**
     * helper function to generate a random big integer
     * @returns {BigInteger} a random value.
     * @private
     */
    private generateRandomSmallA;
    /**
     * helper function to generate a random string
     * @returns {string} a random value.
     * @private
     */
    private generateRandomString;
    /**
     * @returns {string} Generated random value included in password hash.
     */
    getRandomPassword(): string;
    /**
     * @returns {string} Generated random value included in devices hash.
     */
    getSaltDevices(): string;
    /**
     * @returns {string} Value used to verify devices.
     */
    getVerifierDevices(): string;
    /**
     * Generate salts and compute verifier.
     * @param {string} deviceGroupKey Devices to generate verifier for.
     * @param {string} username User to generate verifier for.
     * @param {nodeCallback<null>} callback Called with (err, null)
     * @returns {void}
     */
    generateHashDevice(deviceGroupKey: string, username: string, callback: any): void;
    randomPassword: string;
    SaltToHashDevices: string;
    verifierDevices: string;
    /**
     * Calculate the client's public value A = g^a%N
     * with the generated random number a
     * @param {BigInteger} a Randomly generated small A.
     * @param {nodeCallback<BigInteger>} callback Called with (err, largeAValue)
     * @returns {void}
     * @private
     */
    private calculateA;
    /**
     * Calculate the client's value U which is the hash of A and B
     * @param {BigInteger} A Large A value.
     * @param {BigInteger} B Server B value.
     * @returns {BigInteger} Computed U value.
     * @private
     */
    private calculateU;
    UHexHash: string;
    /**
     * Calculate a hash from a bitArray
     * @param {Buffer} buf Value to hash.
     * @returns {String} Hex-encoded hash.
     * @private
     */
    private hash;
    /**
     * Calculate a hash from a hex string
     * @param {String} hexStr Value to hash.
     * @returns {String} Hex-encoded hash.
     * @private
     */
    private hexHash;
    /**
     * Standard hkdf algorithm
     * @param {Buffer} ikm Input key material.
     * @param {Buffer} salt Salt value.
     * @returns {Buffer} Strong key material.
     * @private
     */
    private computehkdf;
    getPasswordAuthenticationKey(username: any, password: any, serverBValue: any, salt: any, callback: any): void;
    UValue: BigInteger;
    /**
     * Calculates the S value used in getPasswordAuthenticationKey
     * @param {BigInteger} xValue Salted password hash value.
     * @param {BigInteger} serverBValue Server B value.
     * @param {nodeCallback<string>} callback Called on success or error.
     * @returns {void}
     */
    calculateS(xValue: BigInteger, serverBValue: BigInteger, callback: any): void;
    /**
     * Return constant newPasswordRequiredChallengeUserAttributePrefix
     * @return {newPasswordRequiredChallengeUserAttributePrefix} constant prefix value
     */
    getNewPasswordRequiredChallengeUserAttributePrefix(): "userAttributes.";
    /**
     * Converts a BigInteger (or hex string) to hex format padded with zeroes for hashing
     * @param {BigInteger|String} bigInt Number or string to pad.
     * @returns {String} Padded hex string.
     */
    padHex(bigInt: BigInteger | string): string;
}
import BigInteger from "./BigInteger";
