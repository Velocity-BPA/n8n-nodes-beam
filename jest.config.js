/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	roots: ['<rootDir>/test'],
	testMatch: ['**/*.test.ts'],
	collectCoverageFrom: [
		'nodes/**/*.ts',
		'credentials/**/*.ts',
		'!**/*.d.ts',
		'!**/dist/**',
	],
	coverageDirectory: 'coverage',
	coverageReporters: ['text', 'lcov', 'html'],
	moduleFileExtensions: ['ts', 'js', 'json'],
	transform: {
		'^.+\\.ts$': ['ts-jest', {
			tsconfig: {
				module: 'commonjs',
				moduleResolution: 'node',
				target: 'es2022',
				lib: ['es2022'],
				esModuleInterop: true,
				skipLibCheck: true,
				strict: false,
				noImplicitAny: false,
				types: ['node', 'jest'],
			},
		}],
	},
	verbose: true,
	testTimeout: 10000,
	modulePathIgnorePatterns: ['<rootDir>/dist/'],
};
