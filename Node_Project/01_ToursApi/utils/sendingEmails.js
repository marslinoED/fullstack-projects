const nodemailer = require("nodemailer");
module.exports = class Email {
  constructor(user) {
    this.to = user.email;
    this.firstName = user.name.split(" ")[0];
    this.from = `Marslino Tour App <${process.env.emailFrom}>`;
  }
  createTransporter() {
    if (process.env.NODE_ENV === "production") {
      // Use SendGrid in production
      return nodemailer.createTransport({
        service: "SendGrid",
        auth: {
          user: process.env.sendGridUser,
          pass: process.env.sendGridApiKey,
        },
      });
    }
    return nodemailer.createTransport({
      host: process.env.emailHost,
      port: process.env.emailPort,
      secure: false,
      auth: {
        user: process.env.emailUser,
        pass: process.env.emailPass,
      },
    });
  }

  async send(subject, message) {
    if (process.env.NODE_ENV === "testing") {
      console.log("This was supposed to be a mail:", subject, message);
    }
    const sendEmail = this.createTransporter();
    try {
      await sendEmail.sendMail({
        from:
          process.env.NODE_ENV === "production"
            ? process.env.sendGridEmail
            : this.from,
        to: this.to,
        subject,
        text: message,
      });
    } catch (error) {
      console.error("Error sending email:", error.message || error);
      throw error;
    }
  }

  async sendWelcome() {
    await this.send(
      "Welcome to the Marslino Tour App!",
      `Hello ${this.firstName},\n\nWelcome to the Marslino Tour App! We're excited to have you on board.\n\nBest regards,\nMarslino Team`
    );
  }

  async sendPasswordReset(token) {
    await this.send(
      "Your password reset token (valid for only 10 minutes)",
      `Hello ${this.firstName},\n\nYou requested a password reset. Please use the following token to reset your password:\n\n${token}\n\nIf you did not request this, please ignore this email.\n\nBest regards,\nMarslino Team`
    );
  }

  async sendYourPasswordHasChanged() {
    await this.send(
      "Your password has been changed",
      `Hello,\nThis is a confirmation that the password for your account ${this.to} has just been changed.\n`
    );
  }

  async sendLoginNotification() {
    await this.send(
      "New Login Notification",
      `Hello ${this.firstName},\n\nWe noticed a new login to your account. If this was you, no further action is needed. If you did not log in, please reset your password immediately.\n\nBest regards,\nMarslino Team`
    );
  }
};
