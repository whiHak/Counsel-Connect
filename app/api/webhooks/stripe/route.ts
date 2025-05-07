import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import { Booking, ChatRoom } from '@/lib/db/schema';
import connectDB from '@/lib/db/connect';
import Stripe from 'stripe';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'No signature found' }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        webhookSecret
      );
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json({ error: err.message }, { status: 400 });
    }

    // Handle the event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      
      if (!session?.metadata) {
        throw new Error('No metadata found in session');
      }

      await connectDB();

      // Extract booking details from metadata
      const { counselorId, userId, date, timeSlot, sessionType } = session.metadata;
      const [startTime, endTime] = timeSlot.split('-');
      const bookingDate = new Date(date);

      // Create the booking
      const booking = await Booking.create({
        userId,
        counselorId,
        date: bookingDate,
        startTime,
        endTime,
        sessionType,
        status: 'scheduled',
        amount: session.amount_total ? session.amount_total / 100 : 0, // Convert from cents
        paymentStatus: 'paid',
        paymentReference: session.payment_intent
      });

      // Create a chat room for the session if it doesn't exist
      await ChatRoom.findOneAndUpdate(
        {
          $or: [
            { user1Id: userId, user2Id: counselorId },
            { user1Id: counselorId, user2Id: userId },
          ],
        },
        {
          $setOnInsert: {
            user1Id: userId,
            user2Id: counselorId,
            createdAt: new Date(),
          },
        },
        { upsert: true, new: true }
      );
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
