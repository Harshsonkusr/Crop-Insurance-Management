/**
 * AI Task Queue Service
 * Handles async AI processing with retries, backoff, and dead-letter queue
 * Uses BullMQ for production, falls back to database queue for now
 */

import { Logger } from '../utils/logger';
import { prisma } from '../db';

export interface AiTaskInput {
  claimId: string;
  taskType: 'ocr' | 'satellite' | 'fraud_detection';
  inputData: any;
}

export interface AiTaskOutput {
  damagePercent?: number;
  recommendedAmount?: number;
  validationFlags?: any;
  report?: any;
  error?: string;
}

export class AiTaskQueueService {
  private maxRetries = 3;
  private retryDelays = [1000, 5000, 15000]; // 1s, 5s, 15s

  /**
   * Enqueue AI task
   */
  async enqueueTask(input: AiTaskInput): Promise<string> {
    const task = await prisma.aiTask.create({
      data: {
        claimId: input.claimId,
        taskType: input.taskType,
        status: 'pending',
        inputData: input.inputData,
        maxRetries: this.maxRetries,
      },
    });

    // Process asynchronously
    this.processTask(task.id).catch(err => {
      Logger.error(`Failed to process AI task ${task.id}`, { error: err, taskId: task.id });
    });

    return task.id;
  }

  /**
   * Process AI task with retries
   */
  private async processTask(taskId: string) {
    const task = await prisma.aiTask.findUnique({ where: { id: taskId } });
    if (!task) return;

    try {
      // Update status to processing
      await prisma.aiTask.update({
        where: { id: taskId },
        data: {
          status: 'processing',
          processedAt: new Date(),
        },
      });

      // Process based on task type
      let output: AiTaskOutput;
      switch (task.taskType) {
        case 'ocr':
          output = await this.processOCR(task.inputData as any);
          break;
        case 'satellite':
          output = await this.processSatellite(task.inputData as any);
          break;
        case 'fraud_detection':
          output = await this.processFraudDetection(task.inputData as any);
          break;
        default:
          throw new Error(`Unknown task type: ${task.taskType}`);
      }

      // Update claim with AI results - set to admin review status
      await prisma.claim.update({
        where: { id: task.claimId },
        data: {
          aiDamagePercent: output.damagePercent,
          aiRecommendedAmount: output.recommendedAmount,
          aiValidationFlags: output.validationFlags,
          aiReport: output.report,
          verificationStatus: output.error ? 'Pending' : 'AI_Processed_Admin_Review' as any,
        },
      });

      // Mark task as completed
      await prisma.aiTask.update({
        where: { id: taskId },
        data: {
          status: 'completed',
          outputData: output as any,
          completedAt: new Date(),
        },
      });

      // Check if all AI tasks for this claim are completed
      await this.checkAndUpdateClaimVerificationStatus(task.claimId);
    } catch (error: any) {
      await this.handleTaskError(taskId, error);
    }
  }

  /**
   * Handle task error with retry logic
   */
  private async handleTaskError(taskId: string, error: Error) {
    const task = await prisma.aiTask.findUnique({ where: { id: taskId } });
    if (!task) return;

    const retryCount = task.retryCount + 1;

    if (retryCount < task.maxRetries) {
      // Retry with exponential backoff
      const delay = this.retryDelays[retryCount - 1] || 15000;

      await prisma.aiTask.update({
        where: { id: taskId },
        data: {
          retryCount,
          status: 'pending',
          errorMessage: error.message,
        },
      });

      // Retry after delay
      setTimeout(() => {
        this.processTask(taskId).catch(err => {
          Logger.error(`Retry failed for task ${taskId}`, { error: err, taskId });
        });
      }, delay);
    } else {
      // Max retries reached - move to dead letter queue
      await prisma.aiTask.update({
        where: { id: taskId },
        data: {
          status: 'failed',
          errorMessage: `Max retries reached: ${error.message}`,
        },
      });

      // Log to monitoring/alerting system
      Logger.error(`AI task ${taskId} failed after ${retryCount} retries`, { error, taskId, retryCount });
    }
  }

  /**
   * Process OCR task (placeholder)
   */
  private async processOCR(input: any): Promise<AiTaskOutput> {
    // TODO: Integrate with actual OCR service
    // For now, return mock data
    return {
      damagePercent: 0,
      recommendedAmount: 0,
      validationFlags: {},
      report: { ocr: 'processed' },
    };
  }

  /**
   * Process satellite analysis with policy image comparison
   */
  private async processSatellite(input: any): Promise<AiTaskOutput> {
    // TODO: Integrate with satellite imagery service (e.g., Google Earth Engine, Planet Labs)
    const { location, dateOfIncident, images, policyImages } = input;

    // Mock satellite analysis - in production, integrate with actual satellite API
    // This should:
    // 1. Fetch satellite imagery for the location and date
    // 2. Compare with policy images (baseline)
    // 3. Compare with claim images (damage assessment)
    // 4. Calculate damage percentage based on satellite data

    let damagePercent = 0;
    let recommendedAmount = 0;
    const validationFlags: any = {};
    const report: any = {
      satellite: 'processed',
      location,
      dateOfIncident,
      policyImagesCount: policyImages?.length || 0,
      claimImagesCount: images?.length || 0,
    };

    // If policy images exist, note that comparison is possible
    if (policyImages && policyImages.length > 0) {
      report.hasBaselineImages = true;
      report.imageComparisonAvailable = true;
    }

    // Mock damage calculation (replace with actual satellite analysis)
    // In production, use computer vision to compare satellite imagery
    // before and after the incident date
    if (images && images.length > 0) {
      // Placeholder: would use actual satellite imagery analysis
      damagePercent = Math.random() * 50; // Mock value
      recommendedAmount = damagePercent * 1000; // Mock calculation
    }

    return {
      damagePercent,
      recommendedAmount,
      validationFlags,
      report,
    };
  }

  /**
   * Process fraud detection with policy image matching
   */
  private async processFraudDetection(input: any): Promise<AiTaskOutput> {
    // TODO: Integrate with fraud detection ML model and image matching service
    const { claimData, images, documents, policyImages, policyId } = input;

    const validationFlags: any = {
      fraudRisk: 'low',
      imageMatchScore: null,
      locationMatch: true,
      timestampValidation: true,
    };

    const report: any = {
      fraud: 'analyzed',
      policyId,
      policyImagesCount: policyImages?.length || 0,
      claimImagesCount: images?.length || 0,
      imageMatching: {
        performed: false,
        matchScore: null,
        matchedImages: [],
      },
    };

    // Image matching: Compare policy images with claim images
    if (policyImages && policyImages.length > 0 && images && images.length > 0) {
      // TODO: Integrate with image similarity service (e.g., AWS Rekognition, Google Vision API)
      // This should:
      // 1. Extract features from policy images (baseline)
      // 2. Extract features from claim images
      // 3. Compare features to determine if they match the same location/farm
      // 4. Calculate similarity score

      // Mock image matching logic
      // In production, use computer vision APIs to:
      // - Detect if images are from the same location
      // - Match visual features (landmarks, field boundaries, etc.)
      // - Detect inconsistencies (different locations, manipulated images, etc.)

      const mockMatchScore = Math.random() * 100; // Mock similarity score (0-100)
      validationFlags.imageMatchScore = mockMatchScore;
      report.imageMatching.performed = true;
      report.imageMatching.matchScore = mockMatchScore;

      // Determine fraud risk based on match score
      if (mockMatchScore < 30) {
        validationFlags.fraudRisk = 'high';
        validationFlags.reason = 'Low image similarity - images may not be from the same location';
      } else if (mockMatchScore < 60) {
        validationFlags.fraudRisk = 'medium';
        validationFlags.reason = 'Moderate image similarity - manual review recommended';
      } else {
        validationFlags.fraudRisk = 'low';
        validationFlags.reason = 'High image similarity - images appear to be from the same location';
      }

      // Find matched images (mock)
      report.imageMatching.matchedImages = policyImages.slice(0, Math.min(3, policyImages.length)).map((img: any, idx: number) => ({
        policyImageIndex: idx,
        claimImageIndex: idx % images.length,
        similarity: mockMatchScore - (idx * 5),
      }));
    } else {
      report.imageMatching.reason = 'Policy images not available for comparison';
      validationFlags.fraudRisk = 'medium';
      validationFlags.reason = 'Cannot verify image authenticity - policy images missing';
    }

    // Additional fraud checks
    // - Timestamp validation (claim date should be after policy start date)
    // - Location validation (claim location should match policy location)
    // - Document OCR validation
    // - Satellite imagery cross-validation

    return {
      damagePercent: 0, // Damage calculation done in satellite task
      recommendedAmount: 0, // Amount calculation done in satellite task
      validationFlags,
      report,
    };
  }

  /**
   * Get task status
   */
  async getTaskStatus(taskId: string) {
    return await prisma.aiTask.findUnique({ where: { id: taskId } });
  }

  /**
   * Get failed tasks (dead letter queue)
   */
  async getFailedTasks(limit: number = 100) {
    return await prisma.aiTask.findMany({
      where: { status: 'failed' },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Retry failed task
   */
  async retryTask(taskId: string) {
    const task = await prisma.aiTask.findUnique({ where: { id: taskId } });
    if (!task || task.status !== 'failed') {
      throw new Error('Task not found or not in failed state');
    }

    await prisma.aiTask.update({
      where: { id: taskId },
      data: {
        status: 'pending',
        retryCount: 0,
        errorMessage: null,
      },
    });

    this.processTask(taskId).catch(err => {
      Logger.error(`Retry failed for task ${taskId}`, { error: err, taskId });
    });
  }

  /**
   * Check if all AI tasks for a claim are completed and update verification status for admin review
   */
  private async checkAndUpdateClaimVerificationStatus(claimId: string) {
    // Count total and completed tasks for this claim
    const [totalTasks, completedTasks] = await Promise.all([
      prisma.aiTask.count({
        where: { claimId },
      }),
      prisma.aiTask.count({
        where: {
          claimId,
          status: 'completed'
        },
      }),
    ]);

    // If all tasks are completed, update verification status to AI_Processed_Admin_Review
    if (totalTasks > 0 && totalTasks === completedTasks) {
      await prisma.claim.update({
        where: { id: claimId },
        data: {
          verificationStatus: 'AI_Processed_Admin_Review' as any,
        },
      });

      // Notify Admins that a claim is ready for review
      try {
        const admins = await prisma.user.findMany({
          where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] }, status: 'active' },
          select: { id: true }
        });

        const { NotificationService } = await import('./notification.service');
        const claim = await prisma.claim.findUnique({ where: { id: claimId }, select: { claimId: true } });

        await Promise.all(admins.map(admin =>
          NotificationService.create(
            admin.id,
            'New Claim Ready for Review',
            `AI processing for Claim #${claim?.claimId || claimId} is complete. It is now pending your review.`,
            'info'
          )
        ));
      } catch (notifError) {
        Logger.error('Failed to notify admins of completed AI processing', { notifError, claimId });
      }

      Logger.info(`All AI tasks completed for claim ${claimId}, verification status updated to AI_Processed_Admin_Review and notifications sent.`);
    }
  }
}

export const aiTaskQueueService = new AiTaskQueueService();

