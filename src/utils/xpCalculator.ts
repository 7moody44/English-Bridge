/**
 * Calculate XP based on lesson/game score
 * Score range: 0-100
 * XP range: 0-15
 * 
 * Formula: XP = (score / 100) * 15
 * - 100% score = 15 XP
 * - 50% score = 7-8 XP  
 * - 0% score = 0 XP
 */
export const calculateXP = (score: number): number => {
  // Ensure score is within 0-100 range
  const normalizedScore = Math.max(0, Math.min(100, score));
  
  // Calculate XP (0-15 range)
  const xp = Math.round((normalizedScore / 100) * 15);
  
  return xp;
};

/**
 * Calculate XP with bonus for perfect score
 */
export const calculateXPWithBonus = (score: number, perfectBonus: number = 5): number => {
  const baseXP = calculateXP(score);
  
  // Add bonus for perfect score
  if (score === 100) {
    return baseXP + perfectBonus;
  }
  
  return baseXP;
};

/**
 * Get XP tier message
 */
export const getXPMessage = (xp: number): string => {
  if (xp === 0) return 'Keep trying!';
  if (xp <= 5) return 'Good start!';
  if (xp <= 10) return 'Well done!';
  if (xp <= 14) return 'Excellent work!';
  if (xp === 15) return 'Perfect! Amazing!';
  if (xp > 15) return 'Perfect! Bonus earned!';
  return 'Great job!';
};

/**
 * Example usage:
 * 
 * const score = 85; // User scored 85%
 * const xpEarned = calculateXP(score); // Returns 13 XP
 * const message = getXPMessage(xpEarned); // Returns "Excellent work!"
 */
