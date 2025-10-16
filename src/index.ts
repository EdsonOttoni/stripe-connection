import {
  validatorCompiler,
  serializerCompiler,
} from "fastify-type-provider-zod";
import fastify from "fastify";
import fastifyCors from "@fastify/cors";
import { env } from "./env";
import fastifyView from "@fastify/view";
import path from "path";
import ejs from "ejs";
import { stripe } from "./service/stripe-config";
import fastifyFormbody from "@fastify/formbody";
import z from "zod";

const app = fastify();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(fastifyCors, { origin: "*" });

app.register(fastifyFormbody);

app.register(fastifyView, {
  engine: { ejs },
  root: path.join(__dirname, "views"),
  viewExt: "ejs",
});

app.withTypeProvider().get("/", (_, reply) => {
  reply.view("index");
});

app.withTypeProvider().post("/checkout", async (_, reply) => {
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: "brl",
          product_data: {
            name: "Produto Um",
          },
          unit_amount: 50 * 100,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: "http://localhost:3030/complete",
    cancel_url: "http://localhost:3030/cancel",
  });

  if (session.url) {
    reply.redirect(session.url);
  }

  reply.status(400).send({ error: "Error Stripe" });
});

app.withTypeProvider().get("/subscribe", async (request, reply) => {
  const schemaQueryRequest = z.object({
    plan: z.string(),
  });

  const { plan } = schemaQueryRequest.parse(request.query);

  if (!plan) {
    return reply.send("Subscription plan not found");
  }

  let priceId;

  switch (plan.toLocaleLowerCase()) {
    case "starter":
      priceId = "price_1SIZd38Hgb1o26nCieUPoiac";
      break;
    case "pro":
      priceId = "price_1SIwy38Hgb1o26nC1AYa5LFy";
      break;
    default:
      return reply.status(404).send("Subscription plan not found");
  }

  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: "subscription",
    success_url: "http://localhost:3030/complete",
    cancel_url: "http://localhost:3030/cancel",
  });

  if (session.url) {
    reply.redirect(session.url);
  }
});

app
  .listen({
    host: "0.0.0.0",
    port: env.PORT,
  })
  .then((address) => {
    console.log(address);
    console.log(`Server listening on http://localhost:${env.PORT}/`);
  })
  .catch((err) => {
    app.log.error(err);
    process.exit(1);
  });
