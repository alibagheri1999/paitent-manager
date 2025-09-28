// SMS Service for appointment notifications
// This is a mock implementation - replace with actual SMS provider like Twilio

export interface SMSConfig {
  apiKey?: string;
  apiSecret?: string;
  fromNumber?: string;
}

export interface SMSMessage {
  to: string;
  message: string;
}

class SMSService {
  private config: SMSConfig;

  constructor(config: SMSConfig = {}) {
    this.config = config;
  }

  async sendSMS(message: SMSMessage): Promise<boolean> {
    try {
      // In development, just log the message
      if (process.env.NODE_ENV === 'development') {
        console.log('📱 SMS would be sent:');
        console.log(`To: ${message.to}`);
        console.log(`Message: ${message.message}`);
        return true;
      }

      // For production, integrate with actual SMS provider
      // Example with Twilio:
      /*
      const twilio = require('twilio');
      const client = twilio(this.config.apiKey, this.config.apiSecret);
      
      await client.messages.create({
        body: message.message,
        from: this.config.fromNumber,
        to: message.to
      });
      */

      return true;
    } catch (error) {
      console.error('Failed to send SMS:', error);
      return false;
    }
  }

  async sendAppointmentCancellation(
    patientPhone: string,
    patientName: string,
    appointmentDate: string,
    appointmentTime: string,
    reason?: string
  ): Promise<boolean> {
    const message = `Dear ${patientName}, your dental appointment scheduled for ${appointmentDate} at ${appointmentTime} has been cancelled. ${reason ? `Reason: ${reason}` : 'We apologize for any inconvenience.'} Please contact us to reschedule. - Dental Clinic`;

    return this.sendSMS({
      to: patientPhone,
      message: message
    });
  }

  async sendAppointmentReminder(
    patientPhone: string,
    patientName: string,
    appointmentDate: string,
    appointmentTime: string
  ): Promise<boolean> {
    const message = `Dear ${patientName}, this is a reminder for your dental appointment tomorrow at ${appointmentTime}. Please arrive 15 minutes early. - Dental Clinic`;

    return this.sendSMS({
      to: patientPhone,
      message: message
    });
  }

  async sendAppointmentConfirmation(
    patientPhone: string,
    patientName: string,
    appointmentDate: string,
    appointmentTime: string
  ): Promise<boolean> {
    const message = `Dear ${patientName}, your dental appointment has been confirmed for ${appointmentDate} at ${appointmentTime}. We look forward to seeing you! - Dental Clinic`;

    return this.sendSMS({
      to: patientPhone,
      message: message
    });
  }
}

// Create singleton instance
export const smsService = new SMSService({
  apiKey: process.env.TWILIO_ACCOUNT_SID,
  apiSecret: process.env.TWILIO_AUTH_TOKEN,
  fromNumber: process.env.TWILIO_PHONE_NUMBER,
});

export default SMSService;
