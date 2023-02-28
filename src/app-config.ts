import { ZodError, z } from 'zod'

//By default, Zod makes everything required
//So we make sure that all of the keys in our config are always correct
const configSchema = z.object({
    PORT: z.string().default('3000').transform(val => Number(val)),
    API_URL: z.string().url(),
    API_KEY: z.string(),
})

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



export const loadConfig = () => {
    try {
        const config = configSchema.parse(process.env)
        return {
            port: config.PORT,
            apiUrl: config.API_URL,
            apiKey: config.API_KEY,
        }
    } catch (err) {
        if (err instanceof ZodError) {
            console.error('Invalid config', err)
            process.exit(1)
        }
    }
}

//Types vs. Interfaces
//If object is static like API response, it should be an interface
//If promise of object something mutable, it should be a type so you can pass on different methods, etc.