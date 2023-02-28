"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadConfig = void 0;
const zod_1 = require("zod");
//By default, Zod makes everything required
//So we make sure that all of the keys in our config are always correct
const configSchema = zod_1.z.object({
    PORT: zod_1.z.string().default('3000').transform(val => Number(val)),
    API_URL: zod_1.z.string().url(),
    API_KEY: zod_1.z.string(),
});
//object below can be extended to an interface
// interface baseConfig {
//     port: number
// }
// interface apiConfig extends baseConfig {
//     url: string
// }
// //Or we can use types 
// type baseConfig = {
//     port: number, 
// }
// type apiConfig = {
//     url: string,
// }
// // finalConfig is an object that has both keys 
// type finalConfig = baseConfig & apiConfig
const loadConfig = () => {
    try {
        const config = configSchema.parse(process.env);
        return {
            port: config.PORT,
            apiUrl: config.API_URL,
            apiKey: config.API_KEY,
        };
    }
    catch (err) {
        if (err instanceof zod_1.ZodError) {
            console.error('Invalid config', err);
            process.exit(1);
        }
    }
};
exports.loadConfig = loadConfig;
//Types vs. Interfaces
//If object is static like API response, it should be an interface
//If promise of object something mutable, it should be a type so you can pass on different methods, etc.
