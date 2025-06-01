import { hashNonce } from '@/auth/wallet/client-helpers';
import {
  MiniAppWalletAuthSuccessPayload,
  MiniKit,
  verifySiweMessage,
} from '@worldcoin/minikit-js';
// import type { NextAuthConfig } from 'next-auth/core/types'; // Temporarily remove to avoid import error
import Credentials from 'next-auth/providers/credentials';
import type { Session, User } from 'next-auth';
import type { JWT } from 'next-auth/jwt';

// Auth configuration for Wallet Auth based sessions
// For more information on each option (and a full list of options) go to
// https://authjs.dev/getting-started/authentication/credentials
export const authConfig = {
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: 'jwt' },
  providers: [
    Credentials({
      name: 'World App Wallet',
      credentials: {
        nonce: { label: 'Nonce', type: 'text' },
        signedNonce: { label: 'Signed Nonce', type: 'text' },
        finalPayloadJson: { label: 'Final Payload', type: 'text' },
      },
      // @ts-expect-error TODO
      authorize: async ({
        nonce,
        signedNonce,
        finalPayloadJson,
      }: {
        nonce: string;
        signedNonce: string;
        finalPayloadJson: string;
      }) => {
        const expectedSignedNonce = hashNonce({ nonce });

        if (signedNonce !== expectedSignedNonce) {
          console.log('Invalid signed nonce');
          return null;
        }

        const finalPayload: MiniAppWalletAuthSuccessPayload =
          JSON.parse(finalPayloadJson);
        const result = await verifySiweMessage(finalPayload, nonce);

        if (!result.isValid || !result.siweMessageData.address) {
          console.log('Invalid final payload');
          return null;
        }
        // Optionally, fetch the user info from your own database
        const userInfo = await MiniKit.getUserInfo(finalPayload.address);

        return {
          id: finalPayload.address,
          ...userInfo,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: User }) {
      if (user) {
        token.userId = user.id;
        // Ensure these properties exist on the User type or handle them appropriately
        token.walletAddress = (user as any).walletAddress;
        token.username = (user as any).username;
        token.profilePictureUrl = (user as any).profilePictureUrl;
      }

      return token;
    },
    session: async ({ session, token }: { session: Session; token: JWT }) => {
      if (token.userId) {
        (session.user as any).id = token.userId as string;
        // Ensure these properties exist on the Session.user type or handle them appropriately
        (session.user as any).walletAddress = token.walletAddress as string;
        (session.user as any).username = token.username as string;
        (session.user as any).profilePictureUrl = token.profilePictureUrl as string;
      }

      return session;
    },
  },
} // satisfies NextAuthConfig; // Temporarily remove to avoid import error 