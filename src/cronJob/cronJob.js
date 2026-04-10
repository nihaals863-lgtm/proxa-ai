require('dotenv').config();
const cron = require('node-cron');
const { Op } = require('sequelize');
const db = require("../../config/config");
const contract = db.contract;
const renewal_notification = db.renewal_notification;
const { sendEmail } = require('../utils/mailService');
const recipientEmail = process.env.RECIPIENT_EMAIL;

const sendRenewalNotifications = async () => {
    try {
        console.log('Running automated renewal notification job...');

        const targetDays = [30, 60, 90];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (const days of targetDays) {
            const targetDate = new Date(today);
            targetDate.setDate(today.getDate() + days);
            
            // Define a range for the target date to avoid missed notifications
            const nextDay = new Date(targetDate);
            nextDay.setDate(targetDate.getDate() + 1);

            const contracts = await contract.findAll({
                where: {
                    status: 'Active',
                    endDate: {
                        [Op.gte]: targetDate,
                        [Op.lt]: nextDay
                    }
                },
                include: [
                    {
                        model: db.supplier,
                        as: 'supplier',
                        attributes: ['name']
                    }
                ]
            });

            for (const c of contracts) {
                const supplierName = c.supplier?.name || "N/A";
                const intakeNumber = c.intakeRequestId || c.id;
                const expiryDate = c.endDate.toISOString().split('T')[0];

                const emailSubject = `Renewal Alert: ${days} Days Remaining for ${supplierName}`;
                const emailBody = `
Automated Renewal Notification

This is to inform you that the contract for Supplier: ${supplierName} (Intake/Contract ID: ${intakeNumber}) is set to expire on ${expiryDate}.

Please take the necessary actions for renewal or termination.

Regards,
ProX AI System
                `;

                // Send email to a configured recipient or department email
                // Requirement: Dynamic email template will be provided later. 
                // For now, using a standardized text-based format.
                const success = await sendEmail(recipientEmail, emailSubject, emailBody);

                if (success) {
                    console.log(`Email sent for contract ${c.id} (${days} days before expiry)`);
                } else {
                    console.error(`Failed to send email for contract ${c.id}`);
                }
            }
        }
    } catch (error) {
        console.error('Error sending renewal notifications:', error);
    }
};

// Schedule the cron job to run daily at 9:00 AM
cron.schedule('0 9 * * *', () => {
    sendRenewalNotifications();
    console.log('Cron job executed successfully at 9:00 AM.');
});

module.exports = { sendRenewalNotifications };
