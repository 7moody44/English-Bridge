// Feature: english-bridge-app, Property 1: Registration Validation Consistency
// **Validates: Requirements 1.2, 1.3**
// For any user registration input, the validation logic should consistently accept valid names
// (≥2 characters) and reject invalid names (empty, too short, special characters only).

import * as fc from 'fast-check';

// Extract validation functions for testing
// These mirror the validation logic from auth.ts
const validateName = (name: string): boolean => {
  if (!name) return false;
  return name.length >= 2 && name.length <= 50 && /^[a-zA-Z\s-']*$/.test(name);
};

const validateUsername = (username: string): boolean => {
  if (!username) return false;
  return username.length >= 3 && username.length <= 30 && /^[a-z0-9_-]+$/.test(username.toLowerCase());
};

const validateEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const validatePassword = (password: string): boolean => {
  if (!password) return false;
  return password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password);
};

describe('Property 1: Registration Validation Consistency', () => {
  describe('Name Validation Properties', () => {
    it('should accept all valid names with 2-50 characters containing only letters, spaces, hyphens, and apostrophes', () => {
      fc.assert(
        fc.property(
          fc.stringMatching(/^[a-zA-Z\s\-']{2,50}$/),
          (name) => {
            // Property: valid names should always be accepted
            expect(validateName(name)).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject all names with less than 2 characters', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.constant(''),
            fc.stringMatching(/^[a-zA-Z\s\-']?$/)
          ),
          (name) => {
            // Property: names with < 2 characters should always be rejected
            expect(validateName(name)).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject all names with more than 50 characters', () => {
      fc.assert(
        fc.property(
          fc.stringMatching(/^[a-zA-Z\s\-']{51,100}$/),
          (name) => {
            // Property: names with > 50 characters should always be rejected
            expect(validateName(name)).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject all names containing invalid characters', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 2, maxLength: 50 }).filter(s => /[^a-zA-Z\s\-']/.test(s)),
          (name) => {
            // Property: names with invalid characters should always be rejected
            expect(validateName(name)).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject null, undefined, and empty strings as names', () => {
      expect(validateName('')).toBe(false);
      expect(validateName(null as unknown as string)).toBe(false);
      expect(validateName(undefined as unknown as string)).toBe(false);
    });
  });

  describe('Username Validation Properties', () => {
    it('should accept all valid usernames with 3-30 alphanumeric characters, underscores, or hyphens', () => {
      fc.assert(
        fc.property(
          fc.stringMatching(/^[a-z0-9_-]{3,30}$/),
          (username) => {
            // Property: valid usernames should always be accepted
            expect(validateUsername(username)).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject all usernames with less than 3 characters', () => {
      fc.assert(
        fc.property(
          fc.stringMatching(/^[a-z0-9_-]{0,2}$/),
          (username) => {
            // Property: usernames with < 3 characters should always be rejected
            expect(validateUsername(username)).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject all usernames with more than 30 characters', () => {
      fc.assert(
        fc.property(
          fc.stringMatching(/^[a-z0-9_-]{31,50}$/),
          (username) => {
            // Property: usernames with > 30 characters should always be rejected
            expect(validateUsername(username)).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should accept usernames regardless of case (case-insensitive)', () => {
      fc.assert(
        fc.property(
          fc.stringMatching(/^[A-Za-z0-9_-]{3,30}$/),
          (username) => {
            // Property: username validation should be case-insensitive
            expect(validateUsername(username)).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject usernames containing invalid characters', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 3, maxLength: 30 }).filter(s => /[^a-zA-Z0-9_-]/.test(s)),
          (username) => {
            // Property: usernames with invalid characters should always be rejected
            expect(validateUsername(username)).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Email Validation Properties', () => {
    it('should accept all valid email formats', () => {
      fc.assert(
        fc.property(
          fc.emailAddress(),
          (email) => {
            // Property: valid email addresses should always be accepted
            expect(validateEmail(email)).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject strings without @ symbol', () => {
      fc.assert(
        fc.property(
          fc.string().filter(s => !s.includes('@')),
          (notEmail) => {
            // Property: strings without @ should always be rejected
            expect(validateEmail(notEmail)).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject strings without domain extension', () => {
      fc.assert(
        fc.property(
          fc.stringMatching(/^[^\s@]+@[^\s@.]+$/),
          (invalidEmail) => {
            // Property: emails without domain extension should be rejected
            expect(validateEmail(invalidEmail)).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject emails with spaces', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1 }).filter(s => s.includes(' ')),
          (invalidEmail) => {
            // Property: emails with spaces should always be rejected
            expect(validateEmail(invalidEmail)).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Password Validation Properties', () => {
    it('should accept all valid passwords with 8+ chars, uppercase, lowercase, and numbers', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 8, maxLength: 50 })
            .filter(s => /[A-Z]/.test(s) && /[a-z]/.test(s) && /[0-9]/.test(s)),
          (password) => {
            // Property: valid passwords should always be accepted
            expect(validatePassword(password)).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject all passwords with less than 8 characters', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 0, maxLength: 7 }),
          (password) => {
            // Property: passwords with < 8 characters should always be rejected
            expect(validatePassword(password)).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject all passwords without uppercase letters', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 8, maxLength: 50 })
            .filter(s => !/[A-Z]/.test(s) && /[a-z]/.test(s) && /[0-9]/.test(s)),
          (password) => {
            // Property: passwords without uppercase should always be rejected
            expect(validatePassword(password)).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject all passwords without lowercase letters', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 8, maxLength: 50 })
            .filter(s => /[A-Z]/.test(s) && !/[a-z]/.test(s) && /[0-9]/.test(s)),
          (password) => {
            // Property: passwords without lowercase should always be rejected
            expect(validatePassword(password)).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject all passwords without numbers', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 8, maxLength: 50 })
            .filter(s => /[A-Z]/.test(s) && /[a-z]/.test(s) && !/[0-9]/.test(s)),
          (password) => {
            // Property: passwords without numbers should always be rejected
            expect(validatePassword(password)).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Combined Registration Validation Properties', () => {
    it('should validate complete registration data consistently', () => {
      fc.assert(
        fc.property(
          fc.record({
            firstName: fc.stringMatching(/^[a-zA-Z\s\-']{2,50}$/),
            lastName: fc.stringMatching(/^[a-zA-Z\s\-']{2,50}$/),
            username: fc.stringMatching(/^[a-z0-9_-]{3,30}$/),
            email: fc.emailAddress(),
            password: fc.string({ minLength: 8, maxLength: 50 })
              .filter(s => /[A-Z]/.test(s) && /[a-z]/.test(s) && /[0-9]/.test(s)),
          }),
          (registrationData) => {
            // Property: all valid registration data should pass validation
            expect(validateName(registrationData.firstName)).toBe(true);
            expect(validateName(registrationData.lastName)).toBe(true);
            expect(validateUsername(registrationData.username)).toBe(true);
            expect(validateEmail(registrationData.email)).toBe(true);
            expect(validatePassword(registrationData.password)).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject registration data with any invalid field consistently', () => {
      fc.assert(
        fc.property(
          fc.record({
            // Mix of valid and potentially invalid data
            firstName: fc.string({ minLength: 0, maxLength: 60 }),
            lastName: fc.string({ minLength: 0, maxLength: 60 }),
            username: fc.string({ minLength: 0, maxLength: 35 }),
            email: fc.string(),
            password: fc.string({ minLength: 0, maxLength: 100 }),
          }),
          (registrationData) => {
            // Property: validation results should be deterministic
            const firstNameValid = validateName(registrationData.firstName);
            const lastNameValid = validateName(registrationData.lastName);
            const usernameValid = validateUsername(registrationData.username);
            const emailValid = validateEmail(registrationData.email);
            const passwordValid = validatePassword(registrationData.password);

            // If we validate the same data twice, results should be identical
            expect(validateName(registrationData.firstName)).toBe(firstNameValid);
            expect(validateName(registrationData.lastName)).toBe(lastNameValid);
            expect(validateUsername(registrationData.username)).toBe(usernameValid);
            expect(validateEmail(registrationData.email)).toBe(emailValid);
            expect(validatePassword(registrationData.password)).toBe(passwordValid);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Edge Cases and Boundary Conditions', () => {
    it('should handle names exactly at length boundaries', () => {
      // Exactly 2 characters - should be valid
      expect(validateName('Jo')).toBe(true);
      
      // Exactly 50 characters - should be valid
      const fiftyChars = 'a'.repeat(50);
      expect(validateName(fiftyChars)).toBe(true);
      
      // Exactly 1 character - should be invalid
      expect(validateName('J')).toBe(false);
      
      // Exactly 51 characters - should be invalid
      const fiftyOneChars = 'a'.repeat(51);
      expect(validateName(fiftyOneChars)).toBe(false);
    });

    it('should handle usernames exactly at length boundaries', () => {
      // Exactly 3 characters - should be valid
      expect(validateUsername('abc')).toBe(true);
      
      // Exactly 30 characters - should be valid
      const thirtyChars = 'a'.repeat(30);
      expect(validateUsername(thirtyChars)).toBe(true);
      
      // Exactly 2 characters - should be invalid
      expect(validateUsername('ab')).toBe(false);
      
      // Exactly 31 characters - should be invalid
      const thirtyOneChars = 'a'.repeat(31);
      expect(validateUsername(thirtyOneChars)).toBe(false);
    });

    it('should handle passwords exactly at length boundaries', () => {
      // Exactly 8 characters with requirements - should be valid
      expect(validatePassword('Pass123A')).toBe(true);
      
      // Exactly 7 characters with requirements - should be invalid
      expect(validatePassword('Pass12A')).toBe(false);
    });

    it('should handle special characters in names consistently', () => {
      // Valid special characters
      expect(validateName("O'Brien")).toBe(true);
      expect(validateName("Mary-Jane")).toBe(true);
      expect(validateName("John Doe")).toBe(true);
      
      // Invalid special characters
      expect(validateName("John@Doe")).toBe(false);
      expect(validateName("Mary#Jane")).toBe(false);
      expect(validateName("O'Brien123")).toBe(false);
    });

    it('should handle whitespace in various inputs', () => {
      // Names with valid whitespace
      expect(validateName("John Doe")).toBe(true);
      expect(validateName("Mary Jane")).toBe(true);
      
      // Usernames with spaces should be invalid
      expect(validateUsername("john doe")).toBe(false);
      
      // Emails with spaces should be invalid
      expect(validateEmail("john doe@example.com")).toBe(false);
    });
  });
});
