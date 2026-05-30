export interface AccountRegistrationResult {
  readonly userId: string;
  readonly email: string;
  readonly isSignedIn: boolean;
  readonly requiresEmailConfirmation: boolean;
}
