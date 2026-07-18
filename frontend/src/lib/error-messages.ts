export interface ErrorWithSuggestion {
  message: string;
  suggestion?: string;
}

export function getAuthErrorMessage(error: unknown): ErrorWithSuggestion {
  const message =
    error && typeof error === 'object' && 'response' in error
      ? (error as { response: { data: { message: string } } }).response?.data?.message
      : null;

  if (!message) {
    return {
      message: 'An unexpected error occurred',
      suggestion: 'Please try again. If the problem persists, contact support.',
    };
  }

  const lowerMessage = message.toLowerCase();

  // Email already registered
  if (lowerMessage.includes('email already registered')) {
    return {
      message: 'This email is already registered',
      suggestion: 'Try logging in instead, or use a different email address.',
    };
  }

  // Invalid credentials
  if (lowerMessage.includes('invalid credentials')) {
    return {
      message: 'Invalid email or password',
      suggestion: 'Check your email and password, then try again.',
    };
  }

  // User not found
  if (lowerMessage.includes('user not found')) {
    return {
      message: 'Account not found',
      suggestion: 'Please check your email address or create a new account.',
    };
  }

  // Email verification
  if (lowerMessage.includes('invalid or expired verification token')) {
    return {
      message: 'Verification link is invalid or expired',
      suggestion: 'Please request a new verification email from the login page.',
    };
  }

  if (lowerMessage.includes('email is already verified')) {
    return {
      message: 'Your email is already verified',
      suggestion: 'You can proceed to log in to your account.',
    };
  }

  // Generic fallback
  return {
    message,
    suggestion: 'Please try again. If the problem persists, contact support.',
  };
}
