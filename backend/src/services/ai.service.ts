import { Logger } from '../utils/logger';

export class MockAIService {
    /**
     * Simulate AI analysis of a claim
     */
    static async analyzeClaim(claim: any) {
        Logger.info(`Running AI analysis for claim ${claim.id}`);

        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Generate deterministic but "random-looking" results based on claim ID
        const randomSeed = claim.id.charCodeAt(0) + claim.id.charCodeAt(claim.id.length - 1);
        const damagePercentage = Math.min(100, Math.max(0, (randomSeed % 60) + 20)); // Between 20% and 80%
        const isFraudSuspect = randomSeed % 10 === 0; // 10% chance of fraud flag
        const confidenceScore = 0.85 + (randomSeed % 15) / 100; // 0.85 to 0.99

        // Richer Metrics Generation
        const rainfallDeviation = (randomSeed % 200) - 50; // -50% to +150%
        const soilMoisture = (randomSeed % 40) + 30; // 30% to 70%
        const ndvi = 0.3 + (randomSeed % 50) / 100; // 0.3 to 0.8

        const riskFactors = [];
        if (isFraudSuspect) {
            riskFactors.push('Geospatial Mismatch: Image coords > 500m from farm boundary');
            riskFactors.push('Metadata Anomaly: EXIF timestamp mismatch');
        } else {
            // Add some "warnings" even for valid claims to look realistic
            if (rainfallDeviation > 100) riskFactors.push('Extreme Weather Event: Rainfall > 100% variance');
        }

        return {
            claimId: claim.id,
            analyzedAt: new Date(),
            damageAssessment: {
                declaredDamage: claim.estimatedLossPercentage || 0,
                aiEstimatedDamage: damagePercentage,
                confidenceScore: confidenceScore,
                matchStatus: Math.abs(damagePercentage - (claim.estimatedLossPercentage || 0)) < 15 ? 'MATCH' : 'MISMATCH',
                severity: damagePercentage > 70 ? 'CRITICAL' : (damagePercentage > 40 ? 'MODERATE' : 'LOW')
            },
            weatherAnalysis: {
                rainfall: `${120 + (randomSeed % 50)}mm`,
                deviationFromNormal: `${rainfallDeviation > 0 ? '+' : ''}${rainfallDeviation}%`,
                temperatureStress: randomSeed % 2 === 0 ? 'Normal' : 'High Heat Stress Detected',
                floodRisk: rainfallDeviation > 80 ? 'HIGH' : 'LOW'
            },
            cropHealth: {
                ndviIndex: ndvi.toFixed(2),
                chlorophyllContent: 'Low - Yellowing Detected',
                growthStage: 'Vegetative Phase',
                pestactivity: randomSeed % 5 === 0 ? 'Potential Aphid Infestation' : 'None Detected'
            },
            geospatial: {
                locationMatchScore: isFraudSuspect ? 45 : 98,
                fieldBoundaryOverlap: isFraudSuspect ? 'Partial (40%)' : 'Complete (99%)',
                soilType: 'Black Cotton Soil'
            },
            satelliteData: {
                source: 'Sentinel-2 L2A',
                resolution: '10m',
                passDate: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString()
            },
            fraudCheck: {
                isSuspect: isFraudSuspect,
                flags: riskFactors,
                riskScore: isFraudSuspect ? 85 : 12
            },
            recommendation: isFraudSuspect
                ? 'Manual Investigation Required'
                : (Math.abs(damagePercentage - (claim.estimatedLossPercentage || 0)) < 15 ? 'Approve Payout' : 'Adjust Payout based on AI Estimate')
        };
    }
}
