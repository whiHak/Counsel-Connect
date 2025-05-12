import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe';
import { getToken } from "next-auth/jwt";
import Stripe from 'stripe';
import { redirect } from 'next/navigation';

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const headersList = await headers();
    const origin = headersList.get('origin');
    
    const { counselorId, date, timeSlot, sessionType, amount } = await req.json();

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Counseling Session',
              description: `${sessionType} session on ${new Date(date).toLocaleDateString()} at ${timeSlot}`,
            },
            unit_amount: Number(amount ) * 100, // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/messages`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/counselors`,
      metadata: {
        counselorId: counselorId.toString(),
        userId: token.id.toString(),
        date: date.toString(),
        timeSlot,
        sessionType,
      },
    });

    console.log("Checkout session created:", session);

   return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (err: any) {
    console.error('Error creating checkout session:', err);
    return NextResponse.json(
      { error: err.message },
      { status: err.statusCode || 500 }
    );
  }
}