/**
 * Advanced Odds Calculation Engine for Torn City Faction Wars
 * Implements sophisticated algorithms for dynamic odds calculation
 */

class OddsEngine {
    constructor() {
        this.houseEdge = 0.06; // 6% house edge
        this.maxOddsMovement = 0.15; // 15% maximum odds movement per update
        this.circuitBreakerThreshold = 0.25; // 25% movement triggers circuit breaker
        this.momentumDecay = 0.95; // 95% decay per update cycle
        this.volumeWeight = 0.3; // 30% weight for betting volume
        this.scoreWeight = 0.4; // 40% weight for current scores
        this.historyWeight = 0.2; // 20% weight for historical performance
        this.timeWeight = 0.1; // 10% weight for time remaining
        
        // Market sentiment tracking
        this.bettingHistory = new Map(); // Track betting patterns
        this.volumeImbalances = new Map(); // Track volume imbalances
        this.momentumIndicators = new Map(); // Track momentum
        this.circuitBreakers = new Set(); // Track circuit breaker activations
    }

    /**
     * Calculate sophisticated odds for a faction war
     * @param {Object} war - War data object
     * @param {Object} bettingData - Current betting volume data
     * @param {Object} historicalData - Historical faction performance
     * @returns {Object} Calculated odds for both factions
     */
    calculateOdds(war, bettingData = {}, historicalData = {}) {
        const factionIds = Object.keys(war.factions);
        const faction1 = war.factions[factionIds[0]];
        const faction2 = war.factions[factionIds[1]];

        // Check circuit breaker
        if (this.circuitBreakers.has(war.id)) {
            return this.getCircuitBreakerOdds(war);
        }

        // Calculate base probabilities
        const baseProbs = this.calculateBaseProbabilities(war, historicalData);
        
        // Apply market sentiment adjustments
        const sentimentAdjusted = this.applyMarketSentiment(baseProbs, war.id, bettingData);
        
        // Apply dynamic pricing model
        const finalOdds = this.applyDynamicPricing(sentimentAdjusted, war.id, bettingData);
        
        // Validate and apply limits
        const validatedOdds = this.validateOdds(finalOdds, war.id);
        
        // Update tracking data
        this.updateTrackingData(war.id, validatedOdds, bettingData);
        
        return validatedOdds;
    }

    /**
     * Calculate base probabilities using multiple factors
     */
    calculateBaseProbabilities(war, historicalData) {
        const factionIds = Object.keys(war.factions);
        const faction1 = war.factions[factionIds[0]];
        const faction2 = war.factions[factionIds[1]];
        
        // Current score analysis
        const scoreProb1 = this.calculateScoreProbability(faction1, faction2, war.war.target);
        const scoreProb2 = this.calculateScoreProbability(faction2, faction1, war.war.target);
        
        // Rate of progression analysis
        const progressionProb1 = this.calculateProgressionProbability(faction1, war);
        const progressionProb2 = this.calculateProgressionProbability(faction2, war);
        
        // Chain bonus analysis
        const chainProb1 = this.calculateChainProbability(faction1, faction2);
        const chainProb2 = this.calculateChainProbability(faction2, faction1);
        
        // Comprehensive faction strength analysis
        const factionStrengthProb1 = this.calculateFactionStrengthProbability(faction1, faction2);
        const factionStrengthProb2 = this.calculateFactionStrengthProbability(faction2, faction1);
        
        // Historical performance
        const historyProb1 = this.calculateHistoricalProbability(factionIds[0], historicalData);
        const historyProb2 = this.calculateHistoricalProbability(factionIds[1], historicalData);
        
        // Time remaining factor
        const timeProb1 = this.calculateTimeProbability(war);
        const timeProb2 = 1 - timeProb1; // Inverse relationship
        
        // Weighted combination with enhanced faction analysis
        const baseProb1 = (
            scoreProb1 * this.scoreWeight * 0.3 +
            progressionProb1 * this.scoreWeight * 0.2 +
            chainProb1 * this.scoreWeight * 0.1 +
            factionStrengthProb1 * this.scoreWeight * 0.6 +
            historyProb1 * this.historyWeight * 0.3 +
            timeProb1 * this.timeWeight
        );
        
        const baseProb2 = (
            scoreProb2 * this.scoreWeight * 0.3 +
            progressionProb2 * this.scoreWeight * 0.2 +
            chainProb2 * this.scoreWeight * 0.1 +
            factionStrengthProb2 * this.scoreWeight * 0.6 +
            historyProb2 * this.historyWeight * 0.3 +
            timeProb2 * this.timeWeight
        );
        
        // Normalize to ensure they sum to 1
        const total = baseProb1 + baseProb2;
        
        return {
            [factionIds[0]]: baseProb1 / total,
            [factionIds[1]]: baseProb2 / total
        };
    }

    /**
     * Calculate probability based on current scores vs target
     */
    calculateScoreProbability(faction, opponent, target) {
        const totalScore = faction.score + opponent.score;
        if (totalScore === 0) return 0.5;
        
        // Calculate progress towards target
        const progress = totalScore / target;
        const factionProgress = faction.score / target;
        
        // Base probability from current scores
        let prob = faction.score / totalScore;
        
        // Adjust based on target proximity
        if (progress > 0.8) {
            // Near target - favor leading faction more
            const lead = faction.score - opponent.score;
            const leadBonus = Math.min(lead / target, 0.2);
            prob += leadBonus;
        } else if (progress < 0.3) {
            // Early in war - more balanced
            prob = 0.5 + (prob - 0.5) * 0.7;
        }
        
        return Math.max(0.05, Math.min(0.95, prob));
    }

    /**
     * Calculate probability based on score progression rate
     */
    calculateProgressionProbability(faction, war) {
        // This would require historical score data over time
        // For now, use chain as a proxy for progression rate
        const totalChain = Object.values(war.factions).reduce((sum, f) => sum + f.chain, 0);
        if (totalChain === 0) return 0.5;
        
        return faction.chain / totalChain;
    }

    /**
     * Calculate probability based on chain bonuses
     */
    calculateChainProbability(faction, opponent) {
        const totalChain = faction.chain + opponent.chain;
        if (totalChain === 0) return 0.5;
        
        // Chain provides momentum advantage
        const chainAdvantage = faction.chain / totalChain;
        return 0.5 + (chainAdvantage - 0.5) * 0.3; // 30% impact
    }

    /**
     * Calculate probability based on historical performance
     */
    calculateHistoricalProbability(factionId, historicalData) {
        const history = historicalData[factionId] || {};
        
        // Default to 0.5 if no history
        if (!history.winRate && !history.avgScore) return 0.5;
        
        let prob = 0.5;
        
        // Factor in win rate
        if (history.winRate) {
            prob += (history.winRate - 0.5) * 0.3;
        }
        
        // Factor in average score performance
        if (history.avgScore && history.avgScoreBaseline) {
            const scoreRatio = history.avgScore / history.avgScoreBaseline;
            prob += (scoreRatio - 1) * 0.2;
        }
        
        return Math.max(0.05, Math.min(0.95, prob));
    }

    /**
     * Calculate probability based on time remaining
     */
    calculateTimeProbability(war) {
        const now = Math.floor(Date.now() / 1000);
        const startTime = war.war.start;
        const elapsed = now - startTime;
        
        // Assume average war duration of 2 hours (7200 seconds)
        const avgDuration = 7200;
        const progress = Math.min(elapsed / avgDuration, 1);
        
        // Early in war: more uncertainty (closer to 0.5)
        // Late in war: more certainty based on current scores
        return 0.5 + (progress - 0.5) * 0.4;
    }

    /**
     * Calculate probability based on faction respect and ranking
     */
    calculateRespectProbability(faction, opponent) {
        // Use respect as primary factor, with rank and members as modifiers
        const totalRespect = (faction.respect || 0) + (opponent.respect || 0);
        if (totalRespect === 0) return 0.5;
        
        // Base probability from respect
        let prob = (faction.respect || 0) / totalRespect;
        
        // Adjust based on rank difference
        const rankOrder = ['Diamond I', 'Diamond II', 'Diamond III', 'Platinum I', 'Platinum II', 'Platinum III', 'Gold I', 'Gold II', 'Gold III', 'Silver I', 'Silver II', 'Silver III', 'Bronze I', 'Bronze II', 'Bronze III'];
        const factionRankIndex = rankOrder.indexOf(faction.rank || 'Unknown');
        const opponentRankIndex = rankOrder.indexOf(opponent.rank || 'Unknown');
        
        if (factionRankIndex !== -1 && opponentRankIndex !== -1) {
            const rankDifference = opponentRankIndex - factionRankIndex; // Positive if faction is higher ranked
            const rankBonus = (rankDifference * 0.05); // 5% per rank level
            prob += rankBonus;
        }
        
        // Adjust based on member count (larger factions have slight advantage)
        const totalMembers = (faction.members || 0) + (opponent.members || 0);
        if (totalMembers > 0) {
            const memberRatio = (faction.members || 0) / totalMembers;
            const memberBonus = (memberRatio - 0.5) * 0.1; // 10% max impact
            prob += memberBonus;
        }
        
        return Math.max(0.05, Math.min(0.95, prob));
    }

    /**
     * Calculate probability based on faction hall of fame position
     */
    calculatePositionProbability(faction, opponent) {
        // Lower position number = higher ranking = better odds
        const factionPos = faction.position || 999;
        const opponentPos = opponent.position || 999;
        
        // Calculate position-based probability
        const totalPosition = factionPos + opponentPos;
        if (totalPosition === 0) return 0.5;
        
        // Inverse relationship: lower position = higher probability
        let prob = opponentPos / totalPosition;
        
        // Add bonus for significant position differences
        const positionDiff = opponentPos - factionPos;
        if (Math.abs(positionDiff) > 10) {
            const positionBonus = (positionDiff / 100) * 0.15; // 15% max impact
            prob += positionBonus;
        }
        
        return Math.max(0.05, Math.min(0.95, prob));
    }

    /**
     * Calculate comprehensive faction strength probability
     */
    calculateFactionStrengthProbability(faction, opponent) {
        // Combine respect, rank, members, and position for comprehensive analysis
        const respectProb = this.calculateRespectProbability(faction, opponent);
        const positionProb = this.calculatePositionProbability(faction, opponent);
        
        // Weight the factors
        const respectWeight = 0.5; // 50% weight for respect
        const positionWeight = 0.3; // 30% weight for position
        const rankWeight = 0.2; // 20% weight for rank (already included in respect)
        
        let prob = (respectProb * respectWeight) + (positionProb * positionWeight);
        
        // Additional rank-based adjustments
        const rankOrder = ['Diamond I', 'Diamond II', 'Diamond III', 'Platinum I', 'Platinum II', 'Platinum III', 'Gold I', 'Gold II', 'Gold III', 'Silver I', 'Silver II', 'Silver III', 'Bronze I', 'Bronze II', 'Bronze III'];
        const factionRankIndex = rankOrder.indexOf(faction.rank || 'Unknown');
        const opponentRankIndex = rankOrder.indexOf(opponent.rank || 'Unknown');
        
        if (factionRankIndex !== -1 && opponentRankIndex !== -1) {
            const rankDifference = opponentRankIndex - factionRankIndex;
            const rankBonus = (rankDifference * 0.03); // 3% per rank level
            prob += rankBonus;
        }
        
        // Member count adjustment
        const totalMembers = (faction.members || 0) + (opponent.members || 0);
        if (totalMembers > 0) {
            const memberRatio = (faction.members || 0) / totalMembers;
            const memberBonus = (memberRatio - 0.5) * 0.08; // 8% max impact
            prob += memberBonus;
        }
        
        return Math.max(0.05, Math.min(0.95, prob));
    }

    /**
     * Apply market sentiment adjustments
     */
    applyMarketSentiment(baseProbs, warId, bettingData) {
        const warBets = bettingData[warId] || {};
        const factionIds = Object.keys(baseProbs);
        
        // Calculate volume imbalances
        const volume1 = warBets[factionIds[0]] || 0;
        const volume2 = warBets[factionIds[1]] || 0;
        const totalVolume = volume1 + volume2;
        
        if (totalVolume === 0) return baseProbs;
        
        // Calculate volume imbalance
        const imbalance = (volume1 - volume2) / totalVolume;
        
        // Apply smart money vs public money analysis
        const smartMoneyAdjustment = this.calculateSmartMoneyAdjustment(warId, imbalance);
        
        // Apply momentum indicators
        const momentumAdjustment = this.calculateMomentumAdjustment(warId, imbalance);
        
        // Combine adjustments
        const totalAdjustment = smartMoneyAdjustment + momentumAdjustment;
        
        // Apply to probabilities (inverse relationship - more money on faction = lower odds)
        const adjustedProbs = {};
        adjustedProbs[factionIds[0]] = baseProbs[factionIds[0]] * (1 - totalAdjustment * 0.5);
        adjustedProbs[factionIds[1]] = baseProbs[factionIds[1]] * (1 + totalAdjustment * 0.5);
        
        // Normalize
        const total = adjustedProbs[factionIds[0]] + adjustedProbs[factionIds[1]];
        adjustedProbs[factionIds[0]] /= total;
        adjustedProbs[factionIds[1]] /= total;
        
        return adjustedProbs;
    }

    /**
     * Calculate smart money adjustment
     */
    calculateSmartMoneyAdjustment(warId, imbalance) {
        const history = this.bettingHistory.get(warId) || [];
        
        // Analyze recent betting patterns
        if (history.length < 3) return 0;
        
        // Calculate if recent bets are against the public
        const recentImbalance = history.slice(-3).reduce((sum, h) => sum + h.imbalance, 0) / 3;
        const smartMoneySignal = (recentImbalance - imbalance) * 0.5;
        
        return Math.max(-0.1, Math.min(0.1, smartMoneySignal));
    }

    /**
     * Calculate momentum adjustment
     */
    calculateMomentumAdjustment(warId, imbalance) {
        const momentum = this.momentumIndicators.get(warId) || 0;
        
        // Update momentum with decay
        const newMomentum = momentum * this.momentumDecay + imbalance * (1 - this.momentumDecay);
        this.momentumIndicators.set(warId, newMomentum);
        
        return newMomentum * 0.3; // 30% impact
    }

    /**
     * Apply dynamic pricing model
     */
    applyDynamicPricing(probabilities, warId, bettingData) {
        const factionIds = Object.keys(probabilities);
        const warBets = bettingData[warId] || {};
        
        // Calculate total volume for this war
        const totalVolume = factionIds.reduce((sum, id) => sum + (warBets[id] || 0), 0);
        
        // Apply elastic demand curves
        const elasticOdds = {};
        factionIds.forEach(factionId => {
            const baseProb = probabilities[factionId];
            const volume = warBets[factionId] || 0;
            const volumeRatio = totalVolume > 0 ? volume / totalVolume : 0;
            
            // Elastic demand: more volume = lower odds (higher probability)
            const elasticity = 0.2; // 20% elasticity
            const volumeAdjustment = (volumeRatio - baseProb) * elasticity;
            
            elasticOdds[factionId] = Math.max(0.05, Math.min(0.95, baseProb + volumeAdjustment));
        });
        
        // Normalize
        const total = Object.values(elasticOdds).reduce((sum, prob) => sum + prob, 0);
        factionIds.forEach(factionId => {
            elasticOdds[factionId] /= total;
        });
        
        // Apply house edge
        const houseOdds = {};
        factionIds.forEach(factionId => {
            houseOdds[factionId] = elasticOdds[factionId] * (1 - this.houseEdge);
        });
        
        return houseOdds;
    }

    /**
     * Validate odds and apply limits
     */
    validateOdds(odds, warId) {
        const factionIds = Object.keys(odds);
        const previousOdds = this.bettingHistory.get(warId);
        
        if (previousOdds && previousOdds.length > 0) {
            const lastOdds = previousOdds[previousOdds.length - 1].odds;
            
            // Check for maximum movement
            let maxMovement = 0;
            factionIds.forEach(factionId => {
                const movement = Math.abs(odds[factionId] - lastOdds[factionId]);
                maxMovement = Math.max(maxMovement, movement);
            });
            
            if (maxMovement > this.maxOddsMovement) {
                // Apply movement limit
                factionIds.forEach(factionId => {
                    const direction = odds[factionId] > lastOdds[factionId] ? 1 : -1;
                    odds[factionId] = lastOdds[factionId] + (direction * this.maxOddsMovement);
                });
            }
            
            // Check for circuit breaker
            if (maxMovement > this.circuitBreakerThreshold) {
                this.circuitBreakers.add(warId);
                return this.getCircuitBreakerOdds(warId);
            }
        }
        
        return odds;
    }

    /**
     * Get circuit breaker odds (freeze current odds)
     */
    getCircuitBreakerOdds(warId) {
        const history = this.bettingHistory.get(warId);
        if (history && history.length > 0) {
            return history[history.length - 1].odds;
        }
        return null;
    }

    /**
     * Update tracking data
     */
    updateTrackingData(warId, odds, bettingData) {
        const warBets = bettingData[warId] || {};
        const factionIds = Object.keys(odds);
        
        // Calculate volume imbalance
        const volume1 = warBets[factionIds[0]] || 0;
        const volume2 = warBets[factionIds[1]] || 0;
        const totalVolume = volume1 + volume2;
        const imbalance = totalVolume > 0 ? (volume1 - volume2) / totalVolume : 0;
        
        // Store in history
        const history = this.bettingHistory.get(warId) || [];
        history.push({
            timestamp: Date.now(),
            odds: { ...odds },
            volume: { ...warBets },
            imbalance: imbalance
        });
        
        // Keep only last 20 entries
        if (history.length > 20) {
            history.shift();
        }
        
        this.bettingHistory.set(warId, history);
    }

    /**
     * Convert probability to odds percentage
     */
    probabilityToOdds(probability) {
        return Math.round(probability * 100);
    }

    /**
     * Calculate potential return for a bet
     */
    calculateReturn(betAmount, odds) {
        return Math.round(betAmount * (100 / odds));
    }

    /**
     * Reset circuit breaker for a war
     */
    resetCircuitBreaker(warId) {
        this.circuitBreakers.delete(warId);
    }

    /**
     * Get market statistics
     */
    getMarketStats(warId) {
        const history = this.bettingHistory.get(warId) || [];
        const momentum = this.momentumIndicators.get(warId) || 0;
        
        return {
            historyLength: history.length,
            momentum: momentum,
            circuitBreakerActive: this.circuitBreakers.has(warId),
            lastUpdate: history.length > 0 ? history[history.length - 1].timestamp : null
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = OddsEngine;
} 