const twilio = require('twilio');

class SMSService {
  constructor() {
    this.client = null;
    this.smsEnabled = process.env.SMS_ENABLED === 'true';

    if (this.smsEnabled) {
      try {
        this.client = twilio(
          process.env.TWILIO_ACCOUNT_SID,
          process.env.TWILIO_AUTH_TOKEN
        );
        this.fromNumber = process.env.TWILIO_PHONE_NUMBER;
      } catch (error) {
        console.error('Erreur d\'initialisation du service SMS:', error);
        this.smsEnabled = false;
      }
    }
  }

  async sendSMS(to, message) {
    if (!this.smsEnabled) {
      console.log('SMS désactivé. Message qui aurait été envoyé:');
      console.log(`À: ${to}`);
      console.log(`Message: ${message}`);
      return { success: true, message: 'SMS simulé (service désactivé)' };
    }

    try {
      // Formater le numéro au format international si nécessaire
      let formattedNumber = to;
      if (!to.startsWith('+')) {
        // Supposons que les numéros sont ivoiriens (+225)
        formattedNumber = `+225${to.replace(/\s/g, '')}`;
      }

      const response = await this.client.messages.create({
        body: message,
        from: this.fromNumber,
        to: formattedNumber
      });

      console.log('SMS envoyé avec succès:', response.sid);
      return {
        success: true,
        message: 'SMS envoyé avec succès',
        sid: response.sid
      };
    } catch (error) {
      console.error('Erreur lors de l\'envoi du SMS:', error);
      return {
        success: false,
        message: 'Erreur lors de l\'envoi du SMS',
        error: error.message
      };
    }
  }

  async sendAppointmentConfirmation(phoneNumber, patientName, appointmentDate, appointmentTime) {
    const message = `Bonjour ${patientName},\n\nVotre rendez-vous a été confirmé pour le ${appointmentDate} à ${appointmentTime}.\n\nMaster Clinique`;
    return await this.sendSMS(phoneNumber, message);
  }

  async sendAppointmentReminder(phoneNumber, patientName, appointmentDate, appointmentTime) {
    const message = `Bonjour ${patientName},\n\nRappel: Vous avez un rendez-vous demain le ${appointmentDate} à ${appointmentTime}.\n\nMaster Clinique`;
    return await this.sendSMS(phoneNumber, message);
  }

  async sendAppointmentCancellation(phoneNumber, patientName, appointmentDate, appointmentTime) {
    const message = `Bonjour ${patientName},\n\nVotre rendez-vous du ${appointmentDate} à ${appointmentTime} a été annulé.\n\nPour plus d'informations, contactez-nous.\n\nMaster Clinique`;
    return await this.sendSMS(phoneNumber, message);
  }

  async sendAppointmentUpdate(phoneNumber, patientName, oldDate, oldTime, newDate, newTime) {
    const message = `Bonjour ${patientName},\n\nVotre rendez-vous a été modifié.\n\nAncien: ${oldDate} à ${oldTime}\nNouveau: ${newDate} à ${newTime}\n\nMaster Clinique`;
    return await this.sendSMS(phoneNumber, message);
  }
}

module.exports = new SMSService();
