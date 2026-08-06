/**
 * @typedef {Object} LoginRequest
 * @property {string} usernameOrEmail
 * @property {string} password
 */

/**
 * @typedef {Object} RegisterRequest
 * @property {string} fullName
 * @property {string} username
 * @property {string} email
 * @property {string} password
 */

/**
 * @typedef {Object} User
 * @property {number|string} id
 * @property {string} name
 * @property {string} email
 * @property {string} role
 */

/**
 * @typedef {Object} LoginResponse
 * @property {string} token
 * @property {string} [refreshToken]
 * @property {User} user
 */

export {};
