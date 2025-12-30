/**
 * Background Sync Job for External Policies
 * Runs periodically to sync external policies with insurer APIs
 */

import cron from 'node-cron';
import { ExternalPolicyService } from '../services/externalPolicy.service';
import { Logger } from '../utils/logger';

let policySyncInterval: NodeJS.Timeout | null = null;

class PolicySyncJob {
  /**
   * Start the background sync job
   * Runs nightly at 2 AM (using interval check)
   */
  start() {
    // Check every hour if it's 2 AM
    const checkAndRun = async () => {
      const now = new Date();
      const hour = now.getHours();
      if (hour === 2) {
        try {
          Logger.system.job('Starting external policy background sync');
          await ExternalPolicyService.backgroundSync();
          Logger.system.job('External policy background sync completed');
        } catch (error) {
          Logger.error('Error in background policy sync', { error });
        }
      }
    };

    // Run check immediately, then every hour
    checkAndRun();
    policySyncInterval = setInterval(checkAndRun, 60 * 60 * 1000); // Every hour

    Logger.system.job('Background policy sync job started (runs daily at 2 AM)');
  }

  /**
   * Stop the background sync job
   */
  stop() {
    if (policySyncInterval) {
      clearInterval(policySyncInterval);
      policySyncInterval = null;
      Logger.system.job('Background policy sync job stopped');
    }
  }

  /**
   * Run sync manually (for testing or admin trigger)
   */
  async runManual() {
    try {
      Logger.system.job('Running manual external policy sync');
      await ExternalPolicyService.backgroundSync();
      Logger.system.job('Manual external policy sync completed');
    } catch (error) {
      Logger.error('Error in manual policy sync', { error });
      throw error;
    }
  }
}

export const policySyncJob = new PolicySyncJob();

