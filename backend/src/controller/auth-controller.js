import AuthService from "../service/auth-service.js";

export default class AuthController {
    constructor() {
        this.authService = new AuthService();
    }
}