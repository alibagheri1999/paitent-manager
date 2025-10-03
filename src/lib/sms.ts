// SMS Service for appointment notifications using SMS.ir
// Documentation: https://sms.ir/rest-api/

export interface SMSConfig {
  apiKey?: string;
  lineNumber?: string; // SMS.ir line number (خط ارسال)
}

export interface SMSMessage {
  to: string;
  message: string;
}

class SMSService {
  private config: SMSConfig;
  private baseURL = 'https://api.sms.ir/v1';

  constructor(config: SMSConfig = {}) {
    this.config = config;
  }

  async sendSMS(message: SMSMessage): Promise<boolean> {
    try {
      // In development, just log the message
      if (process.env.NODE_ENV === 'development') {
        console.log('📱 SMS would be sent via SMS.ir:');
        console.log(`To: ${message.to}`);
        console.log(`Message: ${message.message}`);
        return true;
      }

      // Check if API key is configured
      if (!this.config.apiKey) {
        console.error('SMS.ir API key is not configured');
        return false;
      }

      // Send SMS via SMS.ir API
      const response = await fetch(`${this.baseURL}/send/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'x-api-key': this.config.apiKey,
        },
        body: JSON.stringify({
          lineNumber: this.config.lineNumber,
          messageText: message.message,
          mobiles: [message.to],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('SMS.ir API error:', response.status, errorData);
        return false;
      }

      const result = await response.json();
      console.log('SMS sent successfully via SMS.ir:', result);
      return true;
    } catch (error) {
      console.error('Failed to send SMS via SMS.ir:', error);
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
    const message = `${patientName} عزیز، نوبت شما در تاریخ ${appointmentDate} ساعت ${appointmentTime} لغو شد. ${reason ? `دلیل: ${reason}` : 'از این بابت پوزش می‌طلبیم.'} لطفاً برای تعیین وقت مجدد تماس بگیرید. - کلینیک دندانپزشکی`;

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
    const message = `${patientName} عزیز، یادآوری: نوبت شما فردا ساعت ${appointmentTime} می‌باشد. لطفاً ۱۵ دقیقه زودتر حضور یابید. - کلینیک دندانپزشکی`;

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
    const message = `${patientName} عزیز، نوبت شما برای تاریخ ${appointmentDate} ساعت ${appointmentTime} تایید شد. منتظر دیدار شما هستیم! - کلینیک دندانپزشکی`;

    return this.sendSMS({
      to: patientPhone,
      message: message
    });
  }

  async sendAppointmentReschedule(
    patientPhone: string,
    patientName: string,
    oldDate: string,
    oldTime: string,
    newDate: string,
    newTime: string,
    reason?: string
  ): Promise<boolean> {
    const message = `${patientName} عزیز، نوبت شما از ${oldDate} ساعت ${oldTime} به ${newDate} ساعت ${newTime} تغییر یافت. ${reason ? `دلیل: ${reason}` : 'از این بابت پوزش می‌طلبیم.'} - کلینیک دندانپزشکی`;

    return this.sendSMS({
      to: patientPhone,
      message: message
    });
  }
}

// Create singleton instance
export const smsService = new SMSService({
  apiKey: process.env.SMS_IR_API_KEY,
  lineNumber: process.env.SMS_IR_LINE_NUMBER,
});

export default SMSService;
