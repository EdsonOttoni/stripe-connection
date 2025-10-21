import { FastifyInstance } from "fastify"
import fastifyRawBody from "fastify-raw-body"
import { env } from "@/env"
import Stripe from "stripe"
import { stripe } from "./stripe-config"

export async function webhookRoute(app: FastifyInstance) {
  await app.register(fastifyRawBody, {
    field: "rawBody",
    global: false,
    encoding: "utf8",
  })

  app
    .withTypeProvider()
    .post("/webhook", { config: { rawBody: true } }, async (request, reply) => {
      const signature = request.headers["stripe-signature"] as string

      let event: Stripe.Event

      try {
        event = stripe.webhooks.constructEvent(
          request.rawBody!,
          signature,
          env.ENDPOINT_SECRET,
        )
      } catch (err) {
        console.log(
          "Webhook signature verification failed",
          (err as Error).message,
        )
        return reply.status(400).send({ error: "Invalid signature" })
      }

      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object as Stripe.Checkout.Session
          console.log("Nova inscrição foi efetuada", session)
          break
        }

        case "invoice.paid": {
          const invoice = event.data.object as Stripe.Invoice
          console.log("Invoice paid", invoice)
          break
        }

        case "invoice.payment_failed": {
          const invoice = event.data.object as Stripe.Invoice
          console.log("Invoice payment failed!", invoice)
          break
        }

        case "payment_intent.succeeded": {
          const paymentIntent = event.data.object as Stripe.PaymentIntent
          console.log("Pagamento bem-sucedido", paymentIntent)
          break
        }

        case "payment_method.attached": {
          const paymentMethod = event.data.object as Stripe.PaymentMethod
          console.log("Método de pagamento anexado", paymentMethod)
          break
        }

        default:
          console.log("Unhandled event type", event.type)
      }

      reply.send({ received: true })
    })
}
