/**
 * Basic test to verify Jest setup is working
 */

describe('Basic setup tests', () => {
  it('should be able to run basic tests', () => {
    expect(1 + 1).toBe(2);
  });

  it('should handle strings correctly', () => {
    const greeting = 'Hello English Bridge!';
    expect(greeting).toContain('English Bridge');
  });

  it('should handle arrays', () => {
    const languages = ['English', 'Spanish', 'French'];
    expect(languages).toHaveLength(3);
    expect(languages).toContain('English');
  });

  it('should handle objects', () => {
    const config = {
      name: 'English Bridge',
      version: '1.0.0',
      features: ['audio', 'progress-tracking', 'lessons'],
    };

    expect(config.name).toBe('English Bridge');
    expect(config.features).toHaveLength(3);
  });
});
