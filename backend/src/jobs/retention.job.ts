/**
 * Retention Cleanup Job
 * Runs periodically to delete old data per retention policies
 */

import { RetentionService } from '../services/retention.service';
import { Logger } from '../utils/logger';

let retentionInterval: NodeJS.Timeout | null = null;

class RetentionJob {
  /**
   * Start the retention cleanup job
   * Runs weekly on Sunday at 3 AM (using interval check)
   */
  start() {
    // Check daily if it's Sunday 3 AM
    const checkAndRun = async () => {
      const now = new Date();
      const day = now.getDay(); // 0 = Sunday
      const hour = now.getHours();
      if (day === 0 && hour === 3) {
        try {
          Logger.system.retention('Starting retention cleanup job');
          await RetentionService.runRetentionCleanup();
          Logger.system.retention('Retention cleanup job completed');
        } catch (error) {
          Logger.error('Error in retention cleanup job', { error });
        }
      }
    };

    // Run check immediately, then every hour
    checkAndRun();
    retentionInterval = setInterval(checkAndRun, 60 * 60 * 1000); // Every hour

    Logger.system.retention('Retention cleanup job started (runs weekly on Sunday at 3 AM)');
  }

  /**
   * Stop the retention cleanup job
   */
  stop() {
    if (retentionInterval) {
      clearInterval(retentionInterval);
      retentionInterval = null;
      Logger.system.retention('Retention cleanup job stopped');
    }
  }
}

export const retentionJob = new RetentionJob();

