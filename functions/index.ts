const functions = require('firebase-functions');
import * as admin from 'firebase-admin';

// Initialize with explicit configuration
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: `https://${process.env.GCLOUD_PROJECT}.firebaseio.com`
});

interface ListUsersData {} // No properties expected from client

interface ListUsersContext {
  auth?: {
    token: {
      email?: string;
      [key: string]: any;
    };
    [key: string]: any;
  };
  [key: string]: any;
}

interface FormattedUser {
  uid: string;
  email: string | undefined;
  displayName: string;
  lastSignIn: string;
  creationTime: string;
  photoURL: string | null;
}

import { firestore } from 'firebase-admin';

interface ListUsersResponse {
  success: boolean;
  users: FormattedUser[];
  timestamp: firestore.FieldValue;
}

exports.listUsers = functions.https.onCall(
  async (
    data: ListUsersData,
    context: ListUsersContext
  ): Promise<ListUsersResponse> => {
    // Verify admin status
    if (!context.auth || context.auth.token.email !== "anishseth0510@gmail.com") {
      throw new functions.https.HttpsError(
        'permission-denied', 
        'Only admin can list users'
      );
    }

    try {
      // Get all users with pagination to handle large user bases
      let allUsers: admin.auth.UserRecord[] = [];
      let nextPageToken: string | undefined;
      
      do {
        const listUsersResult: admin.auth.ListUsersResult = await admin.auth().listUsers(1000, nextPageToken);
        allUsers = allUsers.concat(listUsersResult.users);
        nextPageToken = listUsersResult.pageToken;
      } while (nextPageToken);

      // Format response with proper error handling
      const formattedUsers: FormattedUser[] = allUsers
        .map(user => {
          try {
            return {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName || (user.email ? user.email.split('@')[0] : ''),
              lastSignIn: user.metadata.lastSignInTime,
              creationTime: user.metadata.creationTime,
              photoURL: user.photoURL || null
            };
          } catch (error) {
            console.error(`Error formatting user ${user.uid}:`, error);
            return null;
          }
        })
        .filter((user): user is FormattedUser => user !== null);

      return {
        success: true,
        users: formattedUsers,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      };
      
    } catch (error: any) {
      console.error('Detailed error:', {
        message: error.message,
        stack: error.stack,
        code: error.code
      });
      
      throw new functions.https.HttpsError(
        'internal',
        'Failed to fetch user list',
        {
          debugInfo: 'Please check function logs for details',
          originalError: error.message
        }
      );
    }
  }
);