const swcTransform = [
  '@swc/jest',
  {
    jsc: {
      parser: {
        syntax: 'typescript',
      },
      target: 'es2020',
    },
    module: {
      type: 'commonjs',
    },
  },
]

module.exports = {
  projects: [
    {
      displayName: 'unit',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/tests/unit/**/*.test.ts'],
      transform: {
        '^.+\\.ts$': swcTransform,
      },
    },
    {
      displayName: 'acceptance',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/tests/acceptance/**/*.test.ts'],
      testTimeout: 30000,
      transform: {
        '^.+\\.ts$': swcTransform,
      },
    },
  ],
}
