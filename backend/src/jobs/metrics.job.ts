/**
 * Metrics and SLO Monitoring Job
 * Runs periodically to check SLOs and generate alerts
 */

import { MetricsService } from '../services/metrics.service';
import { Logger } from '../utils/logger';

let metricsInterval: NodeJS.Timeout | null = null;

class MetricsJob {
  /**
   * Start the metrics monitoring job
   * Runs every 15 minutes
   */
  start() {
    // Run every 15 minutes
    const runChecks = async () => {
      try {
        Logger.system.metrics('Running SLO checks');
        await MetricsService.runSLOChecks();
      } catch (error) {
        Logger.error('Error in metrics job', { error });
      }
    };

    // Run immediately, then every 15 minutes
    runChecks();
    metricsInterval = setInterval(runChecks, 15 * 60 * 1000); // Every 15 minutes

    Logger.system.metrics('Metrics monitoring job started (runs every 15 minutes)');
  }

  /**
   * Stop the metrics monitoring job
   */
  stop() {
    if (metricsInterval) {
      clearInterval(metricsInterval);
      metricsInterval = null;
      Logger.system.metrics('Metrics monitoring job stopped');
    }
  }
}

export const metricsJob = new MetricsJob();

