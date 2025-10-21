import "dotenv/config"
import { z } from "zod"

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),

  STRIPE_PUBLISHABLE_KEY: z.string(),
  STRIPE_SECRET_KEY: z.string(),
  STRIPE_ID_ACCOUNT: z.string(),

  ENDPOINT_SECRET: z.string(),
})

const _env = envSchema.safeParse(process.env)

if (_env.success === false) {
  const tree = z.treeifyError(_env.error).properties
  console.log(tree)
  throw new Error(`Variáveis ​​de ambiente inválidas`)
}

export const env = _env.data
