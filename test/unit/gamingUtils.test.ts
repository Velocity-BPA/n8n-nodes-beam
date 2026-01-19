/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import {
	calculateLevel,
	calculateWinRate,
	getRank,
	parsePlayerStats,
	isAchievementUnlocked,
	getAchievementProgress,
	sortByRarity,
	calculateEloChange,
	parseMatchResult,
	generateMatchId,
	validateGameAction,
	type Achievement,
	type GameAsset,
} from '../../nodes/Beam/utils/gamingUtils';

describe('Gaming Utilities', () => {
	describe('calculateLevel', () => {
		it('should calculate level 1 for 0 experience', () => {
			const result = calculateLevel(0);
			expect(result.level).toBe(1);
		});

		it('should include progress information', () => {
			const result = calculateLevel(500);
			expect(result).toHaveProperty('level');
			expect(result).toHaveProperty('currentXP');
			expect(result).toHaveProperty('nextLevelXP');
			expect(result).toHaveProperty('progress');
		});
	});

	describe('calculateWinRate', () => {
		it('should calculate win rate correctly', () => {
			expect(calculateWinRate(5, 10)).toBe(50);
			expect(calculateWinRate(10, 10)).toBe(100);
			expect(calculateWinRate(0, 10)).toBe(0);
		});

		it('should handle zero total games', () => {
			expect(calculateWinRate(0, 0)).toBe(0);
		});
	});

	describe('getRank', () => {
		it('should return correct rank for rating', () => {
			expect(getRank(2500)).toBe('Grandmaster');
			expect(getRank(2200)).toBe('Master');
			expect(getRank(1900)).toBe('Diamond');
			expect(getRank(1600)).toBe('Platinum');
			expect(getRank(1300)).toBe('Gold');
			expect(getRank(1000)).toBe('Silver');
			expect(getRank(700)).toBe('Bronze');
			expect(getRank(500)).toBe('Unranked');
		});
	});

	describe('parsePlayerStats', () => {
		it('should parse player stats correctly', () => {
			const data = {
				gamesPlayed: BigInt(100),
				wins: BigInt(60),
				losses: BigInt(30),
				totalXP: BigInt(5000),
			};
			const stats = parsePlayerStats(data);
			expect(stats.gamesPlayed).toBe(100);
			expect(stats.wins).toBe(60);
			expect(stats.losses).toBe(30);
			expect(stats.draws).toBe(10); // 100 - 60 - 30
			expect(stats.totalXP).toBe(5000);
			expect(stats.level).toBeGreaterThanOrEqual(1);
		});
	});

	describe('isAchievementUnlocked', () => {
		it('should return true if unlockedAt is set', () => {
			const achievement: Achievement = {
				id: '1',
				name: 'Test',
				description: 'Test achievement',
				unlockedAt: Date.now(),
			};
			expect(isAchievementUnlocked(achievement)).toBe(true);
		});

		it('should return true if progress equals max', () => {
			const achievement: Achievement = {
				id: '1',
				name: 'Test',
				description: 'Test achievement',
				progress: 10,
				maxProgress: 10,
			};
			expect(isAchievementUnlocked(achievement)).toBe(true);
		});

		it('should return false if progress is less than max', () => {
			const achievement: Achievement = {
				id: '1',
				name: 'Test',
				description: 'Test achievement',
				progress: 5,
				maxProgress: 10,
			};
			expect(isAchievementUnlocked(achievement)).toBe(false);
		});
	});

	describe('getAchievementProgress', () => {
		it('should return 100 if unlocked', () => {
			const achievement: Achievement = {
				id: '1',
				name: 'Test',
				description: 'Test',
				unlockedAt: Date.now(),
			};
			expect(getAchievementProgress(achievement)).toBe(100);
		});

		it('should calculate progress percentage', () => {
			const achievement: Achievement = {
				id: '1',
				name: 'Test',
				description: 'Test',
				progress: 5,
				maxProgress: 10,
			};
			expect(getAchievementProgress(achievement)).toBe(50);
		});
	});

	describe('sortByRarity', () => {
		it('should sort assets by rarity (highest first)', () => {
			const assets: GameAsset[] = [
				{ tokenId: '1', contractAddress: '0x1', name: 'Common', rarity: 'common', attributes: {} },
				{ tokenId: '2', contractAddress: '0x1', name: 'Legendary', rarity: 'legendary', attributes: {} },
				{ tokenId: '3', contractAddress: '0x1', name: 'Rare', rarity: 'rare', attributes: {} },
			];
			const sorted = sortByRarity(assets);
			expect(sorted[0].rarity).toBe('legendary');
			expect(sorted[sorted.length - 1].rarity).toBe('common');
		});
	});

	describe('calculateEloChange', () => {
		it('should increase rating for win', () => {
			const change = calculateEloChange(1500, 1500, 'win');
			expect(change).toBeGreaterThan(0);
		});

		it('should decrease rating for loss', () => {
			const change = calculateEloChange(1500, 1500, 'loss');
			expect(change).toBeLessThan(0);
		});

		it('should give small change for draw between equal players', () => {
			const change = calculateEloChange(1500, 1500, 'draw');
			expect(Math.abs(change)).toBeLessThan(5);
		});
	});

	describe('parseMatchResult', () => {
		it('should parse match results correctly', () => {
			expect(parseMatchResult(1)).toBe('win');
			expect(parseMatchResult(-1)).toBe('loss');
			expect(parseMatchResult(0)).toBe('draw');
		});
	});

	describe('generateMatchId', () => {
		it('should generate unique match IDs', () => {
			const id1 = generateMatchId();
			const id2 = generateMatchId();
			expect(id1).not.toBe(id2);
			expect(id1).toMatch(/^match-/);
		});
	});

	describe('validateGameAction', () => {
		it('should validate known actions', () => {
			const result = validateGameAction('use_item', { itemId: '123' });
			expect(result.valid).toBe(true);
		});

		it('should reject missing required params', () => {
			const result = validateGameAction('use_item', {});
			expect(result.valid).toBe(false);
			expect(result.error).toContain('itemId');
		});

		it('should allow unknown actions', () => {
			const result = validateGameAction('custom_action', { anything: 'works' });
			expect(result.valid).toBe(true);
		});
	});
});
