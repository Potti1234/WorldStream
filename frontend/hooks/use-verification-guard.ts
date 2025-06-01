import { useState, useEffect } from 'react';
import { MiniKit, VerifyCommandInput, VerificationLevel, ISuccessResult } from '@worldcoin/minikit-js'
import { clientLogger } from '@/lib/client-logger'
import { useVerification } from '@/contexts/verification-context'

const VERIFICATION_STORAGE_KEY = 'worldstream_verified'
const VERIFICATION_ATTEMPTED_KEY = 'worldstream_verification_attempted'

export const useVerificationGuard = () => {
  const [isVerifying, setIsVerifying] = useState(false);
  const { isVerified, setIsVerified } = useVerification();

  // Check localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedVerified = localStorage.getItem(VERIFICATION_STORAGE_KEY)
      if (storedVerified === 'true') {
        setIsVerified(true)
      }
    }
  }, [setIsVerified])

  const verifyPayload: VerifyCommandInput = {
    action: 'verification',
    verification_level: VerificationLevel.Device
  };

  const handleVerify = async (): Promise<boolean> => {
    try {
      setIsVerifying(true);
      
      clientLogger.info('World App is installed ✓', {}, 'handleVerify');
      
      const { finalPayload } = await MiniKit.commandsAsync.verify(verifyPayload);
      
      if (finalPayload.status === 'error') {
        console.log('Error payload', finalPayload);
        return false;
      }
      
      const verifyResponse = await fetch('/api/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payload: finalPayload as ISuccessResult, // Parses only the fields we need to verify
          action: 'verification',
        }),
      });
      
      const verifyResponseJson = await verifyResponse.json();
      
      if (verifyResponseJson.status === 200) {
        clientLogger.info('Verification success!', {}, 'handleVerify');
        setIsVerified(true);
        // Store verification state in localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem(VERIFICATION_STORAGE_KEY, 'true')
        }
        return true;
      } else {
        clientLogger.error('Verification failed', {}, 'handleVerify');
        return false;
      }
    } catch (error) {
      clientLogger.error('Verification error:', error, 'handleVerify');
      return false;
    } finally {
      setIsVerifying(false);
    }
  };

  const withVerification = async (
    action: () => void,
    options: { onSuccess?: () => void; onError?: () => void } = {}
  ) => {
    // If verification has been attempted before, proceed without verification
    if (typeof window !== 'undefined' && localStorage.getItem(VERIFICATION_ATTEMPTED_KEY) === 'true') {
      action();
      options.onSuccess?.();
      return true;
    }

    // If already verified or not on a mobile device, proceed without verification
    if (isVerified || (typeof window !== 'undefined' && !window.matchMedia('(pointer:coarse)').matches && !window.matchMedia('(max-device-width: 480px)').matches)) {
      action();
      options.onSuccess?.();
      return true;
    }

    // Mark that verification has been attempted
    if (typeof window !== 'undefined') {
      localStorage.setItem(VERIFICATION_ATTEMPTED_KEY, 'true')
    }

    // If not verified, proceed with verification
    const username = MiniKit.user.username;
    clientLogger.info('MiniKit user', username, 'withVerification');

    const verified = await handleVerify();
    if (verified) {
      action();
      options.onSuccess?.();
    } else {
      options.onError?.();
    }
    return verified;
  };

  return {
    withVerification,
    isVerifying,
  };
};

