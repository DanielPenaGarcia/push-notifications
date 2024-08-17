import { FirebaseAuthGuard } from '../firebase-auth/firebase-auth.guard';

describe('FirebaseAuthGuard', () => {
  it('should be defined', () => {
    expect(new FirebaseAuthGuard()).toBeDefined();
  });
});
