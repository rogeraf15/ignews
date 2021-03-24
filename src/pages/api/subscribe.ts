import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from 'next-auth/client';
import { stripe } from "../../services/stripe";

export default async(req: NextApiRequest, res: NextApiResponse) => {
  if(req.method === 'POST'){
    //pegar a sessao para pegar o usuario
    const session = await getSession({ req });

    //criar um customer para o stripe
    const stripeCustomer = await stripe.customers.create({
      email: session.user.email,
    })

    const stripeCheckoutSession = await stripe.checkout.sessions.create({
      customer: stripeCustomer.id,
      payment_method_types: ['card'],
      billing_address_collection: 'required',
      line_items: [
        {price: 'price_1IY9dCF6hXpjwToysmCkG2WV', quantity: 1}
      ],
      mode: 'subscription',
      allow_promotion_codes: true,
      success_url: process.env.STRIPE_SUCCESS_URL,
      cancel_url: process.env.STRIPE_CANCEL_URL,
    })

    return res.status(200).json({sessionId: stripeCheckoutSession.id})
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method not allowed');
  }
}