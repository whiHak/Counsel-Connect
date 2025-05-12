import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { User } from '@/lib/db/schema';

interface GoogleApiError extends Error {
  message: string;
}

// Initialize the OAuth2 client
const getOAuth2Client = () => {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
};

export const createMeetingEvent = async (
  userId: string,
  title: string,
  description: string,
  startTime: Date,
  endTime: Date,
  attendees: string[]
) => {
  try {
    // Get user with refresh token
    const user = await User.findById(userId).select('+googleCalendar.refreshToken');
    
    if (!user?.googleCalendar?.refreshToken) {
      throw new Error('Google Calendar not authorized');
    }

    // Create new OAuth2 client for this request
    const oauth2Client = getOAuth2Client();
    
    // Set credentials using user's refresh token
    oauth2Client.setCredentials({
      refresh_token: user.googleCalendar.refreshToken
    });

    // Create Calendar client with user's auth
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const event = {
      summary: title,
      description,
      start: {
        dateTime: startTime.toISOString(),
        timeZone: 'UTC',
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: 'UTC',
      },
      attendees: attendees.map(email => ({ email })),
      conferenceData: {
        createRequest: {
          requestId: `${Date.now()}-${Math.random().toString(36).substring(7)}`,
          conferenceSolutionKey: {
            type: 'hangoutsMeet'
          }
        }
      }
    };

    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
      conferenceDataVersion: 1,
    });

    return {
      eventId: response.data.id,
      meetLink: response.data.hangoutLink,
      eventLink: response.data.htmlLink
    };
  } catch (error) {
    console.error('Error creating calendar event:', error);
    // Handle token revocation or expiration
    const googleError = error as GoogleApiError;
    if (googleError.message?.includes('invalid_grant')) {
      await User.findByIdAndUpdate(userId, {
        $set: {
          'googleCalendar.isConnected': false,
          'googleCalendar.refreshToken': null
        }
      });
    }
    throw error;
  }
};

// Function to store user's refresh token
export const storeUserRefreshToken = async (userId: string, refreshToken: string) => {
  try {
    await User.findByIdAndUpdate(userId, {
      $set: {
        'googleCalendar.refreshToken': refreshToken,
        'googleCalendar.isConnected': true,
        'googleCalendar.lastSync': new Date()
      }
    });
    return true;
  } catch (error) {
    console.error('Error storing refresh token:', error);
    throw error;
  }
}; 