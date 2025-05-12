import { NextRequest, NextResponse } from "next/server";
import { google } from 'googleapis';
import { getToken } from "next-auth/jwt";
import { storeUserRefreshToken } from "@/lib/google/calendar";

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

export async function GET(req: NextRequest) {
  try {
    // Get the authenticated user
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const userId = token?.userId;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const code = url.searchParams.get('code');

    if (!code) {
      return NextResponse.json({ error: 'No code provided' }, { status: 400 });
    }

    // Get tokens from code
    const { tokens } = await oauth2Client.getToken(code);
    const refreshToken = tokens.refresh_token;

    if (!refreshToken) {
      return NextResponse.json({ error: 'No refresh token received' }, { status: 400 });
    }

    // Store the refresh token for the user
    await storeUserRefreshToken(userId.toString(), refreshToken);

    // Redirect back to the messages page with success message
    return NextResponse.redirect(new URL('/messages?calendar=connected', req.url));

  } catch (error) {
    console.error('Error getting refresh token:', error);
    return NextResponse.redirect(new URL('/messages?calendar=error', req.url));
  }
} 