/**
 * Metrics and Monitoring Service
 * Tracks SLOs, performance metrics, and generates alerts
 */

import { prisma } from '../db';
import { Logger } from '../utils/logger';

export interface Metric {
  name: string;
  value: number;
  timestamp: Date;
  tags?: Record<string, string>;
}

export interface SLO {
  name: string;
  target: number; // Percentage (0-100)
  window: number; // Time window in minutes
}

export class MetricsService {
  // SLO Definitions
  private static readonly SLOs: SLO[] = [
    {
      name: 'ai_job_processing_time',
      target: 80, // 80% of AI jobs processed < 10 min
      window: 60,
    },
    {
      name: 'api_success_rate',
      target: 95, // 95% API success rate
      window: 60,
    },
    {
      name: 'api_latency_p99',
      target: 1000, // 99th percentile latency < 1s (in ms)
      window: 60,
    },
  ];

  /**
   * Record a metric
   */
  static async recordMetric(metric: Metric): Promise<void> {
    try {
      // In production, send to metrics backend (Prometheus, DataDog, etc.)
      // For now, log to database or file
      Logger.system.metrics(`Metric: ${metric.name} = ${metric.value}`, {
        timestamp: metric.timestamp,
        tags: metric.tags,
      });
    } catch (error) {
      Logger.error('Error recording metric', { error, metric });
    }
  }

  /**
   * Check AI task processing SLO
   */
  static async checkAiTaskSLO(): Promise<{ met: boolean; percentage: number }> {
    const windowStart = new Date(Date.now() - 60 * 60 * 1000); // Last hour

    const tasks = await prisma.aiTask.findMany({
      where: {
        createdAt: { gte: windowStart },
        status: 'completed',
      },
    });

    if (tasks.length === 0) {
      return { met: true, percentage: 100 };
    }

    // Check how many completed within 10 minutes
    const tenMinutes = 10 * 60 * 1000;
    const fastTasks = tasks.filter((task) => {
      if (!task.completedAt || !task.processedAt) return false;
      const duration = task.completedAt.getTime() - task.processedAt.getTime();
      return duration < tenMinutes;
    });

    const percentage = (fastTasks.length / tasks.length) * 100;
    const met = percentage >= 80; // 80% target

    await this.recordMetric({
      name: 'ai_job_processing_time',
      value: percentage,
      timestamp: new Date(),
      tags: { met: met.toString() },
    });

    return { met, percentage };
  }

  /**
   * Check API success rate SLO
   */
  static async checkApiSuccessRateSLO(): Promise<{ met: boolean; percentage: number }> {
    // In production, query metrics from monitoring system
    // For now, return placeholder
    const percentage = 98; // Placeholder
    const met = percentage >= 95;

    await this.recordMetric({
      name: 'api_success_rate',
      value: percentage,
      timestamp: new Date(),
      tags: { met: met.toString() },
    });

    return { met, percentage };
  }

  /**
   * Check queue depth and alert if high
   */
  static async checkQueueDepth(): Promise<{ depth: number; alert: boolean }> {
    const pendingTasks = await prisma.aiTask.count({
      where: {
        status: { in: ['pending', 'processing'] },
      },
    });

    const depth = pendingTasks;
    const alert = depth > 100; // Alert if more than 100 pending tasks

    if (alert) {
      Logger.system.alert('High queue depth detected', { depth });
    }

    await this.recordMetric({
      name: 'ai_queue_depth',
      value: depth,
      timestamp: new Date(),
      tags: { alert: alert.toString() },
    });

    return { depth, alert };
  }

  /**
   * Get AI performance metrics
   */
  static async getAiPerformanceMetrics() {
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const tasks = await prisma.aiTask.findMany({
      where: {
        createdAt: { gte: last24Hours },
      },
    });

    const completed = tasks.filter((t) => t.status === 'completed').length;
    const failed = tasks.filter((t) => t.status === 'failed').length;
    const pending = tasks.filter((t) => t.status === 'pending' || t.status === 'processing').length;

    const avgProcessingTime = tasks
      .filter((t) => t.completedAt && t.processedAt)
      .reduce((sum, t) => {
        const duration = t.completedAt!.getTime() - t.processedAt!.getTime();
        return sum + duration;
      }, 0) / completed || 0;

    return {
      total: tasks.length,
      completed,
      failed,
      pending,
      successRate: tasks.length > 0 ? (completed / tasks.length) * 100 : 0,
      avgProcessingTimeMs: avgProcessingTime,
    };
  }

  /**
   * Run SLO checks and generate alerts
   */
  static async runSLOChecks(): Promise<void> {
    try {
      const aiSLO = await this.checkAiTaskSLO();
      const apiSLO = await this.checkApiSuccessRateSLO();
      const queueDepth = await this.checkQueueDepth();

      if (!aiSLO.met) {
        Logger.system.alert('AI job processing SLO not met', {
          percentage: aiSLO.percentage,
          target: 80,
        });
      }

      if (!apiSLO.met) {
        Logger.system.alert('API success rate SLO not met', {
          percentage: apiSLO.percentage,
          target: 95,
        });
      }

      if (queueDepth.alert) {
        Logger.system.alert('High queue depth', { depth: queueDepth.depth });
      }
    } catch (error) {
      Logger.error('Error in SLO checks', { error });
    }
  }
}

