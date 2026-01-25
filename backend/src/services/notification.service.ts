import { prisma } from '../db';
import { Logger } from '../utils/logger';

export class NotificationService {
    /**
     * Create a new notification for a user
     */
    static async create(
        userId: string,
        title: string,
        message: string,
        type: 'info' | 'success' | 'warning' | 'error' = 'info'
    ) {
        try {
            const notification = await prisma.notification.create({
                data: {
                    userId,
                    title,
                    message,
                    type,
                    read: false
                }
            });

            if (notification) {
                // Also trigger email if it's a critical update
                if (['success', 'warning', 'error'].includes(type) || type === 'info') {
                    // Determine user email
                    const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true, name: true } });

                    if (user && user.email) {
                        import('./email.service').then(({ EmailService }) => {
                            EmailService.sendEmail(
                                user.email!,
                                title,
                                `<div style="font-family: sans-serif; padding: 20px;">
                                    <h2>${title}</h2>
                                    <p>Dear ${user.name},</p>
                                    <p>${message}</p>
                                    <hr/>
                                    <p style="font-size: 12px; color: gray;">This is an automated message from the Crop Insurance Management System.</p>
                                </div>`
                            );
                        });
                    }
                }
            }
            return notification;
        } catch (error) {
            Logger.error('Failed to create notification', { error, userId, title });
            return null;
        }
    }

    /**
     * Notify farmer about claim status change
     */
    static async notifyClaimStatusChange(
        farmerId: string,
        claimId: string,
        status: string,
        reason?: string
    ) {
        let title = 'Claim Status Update';
        let message = `Your claim #${claimId} status has been updated to ${status}.`;
        let type: 'info' | 'success' | 'warning' | 'error' = 'info';

        switch (status.toLowerCase()) {
            case 'approved':
                title = 'Claim Approved! 🎉';
                message = `Good news! Your claim #${claimId} has been approved. You should receive the payout details shortly.`;
                type = 'success';
                break;
            case 'rejected':
                title = 'Claim Rejected';
                message = `Your claim #${claimId} was rejected. Reason: ${reason || 'Not specified'}`;
                type = 'error';
                break;
            case 'fraud_suspect':
                title = 'Claim Under Verification';
                message = `Your claim #${claimId} has been flagged for detailed verification.`;
                type = 'warning';
                break;
            case 'under_review':
                title = 'Claim Under Review';
                message = `Your claim #${claimId} is now being reviewed by the insurer.`;
                type = 'info';
                break;
        }

        await this.create(farmerId, title, message, type);
    }
}
