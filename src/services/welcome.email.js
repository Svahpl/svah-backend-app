import nodemailer from "nodemailer"; // no curly braces

const transporter = nodemailer.createTransport({
    secure: true,
    host: "smtp.gmail.com",
    port: 465,
    auth: {
        user: process.env.NODEMAILER_USER_EMAIL,
        pass: process.env.NODEMAILER_USER_PASSWORD,
    },
});

const welcomeTemplate = (name, email) => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Welcome to Sri Venkateswara Agros and Herbs!</title>
  <style>
    /* Your CSS remains unchanged */
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">Sri Venkateswara Agros and Herbs</div>
      <div class="sub-logo">Natural Products • Since 2021</div>
    </div>
    <div class="content">
      <h1>Welcome, ${name}!</h1>
      <p>We're thrilled to have you at <strong>Sri Venkateswara Agros and Herbs</strong> — your trusted destination for <em>natural agricultural and herbal products</em>.</p>
      <p>We've successfully created your account with the email: <strong>${email}</strong></p>
      <div class="benefits">
        <div class="benefit">
          <div class="benefit-icon">🌿</div>
          <div>100% Natural</div>
          <div>Eco-Friendly Products</div>
        </div>
        <div class="benefit">
          <div class="benefit-icon">🚚</div>
          <div>Fast Delivery</div>
          <div>Pan India</div>
        </div>
        <div class="benefit">
          <div class="benefit-icon">💳</div>
          <div>Secure Payment</div>
          <div>Multiple Options</div>
        </div>
      </div>
      <p>We can’t wait for you to explore our range and see the difference <strong>Sri Venkateswara Agros and Herbs</strong> brings to your home and health.</p>
      <center>
        <a href="https://svahagro.com/shop" class="button">SHOP NOW</a>
      </center>
    </div>
    <div class="footer">
      <p>This email was sent to ${email}. For support, contact us at <a href="mailto:svahpl1@gmail.com">svahpl1@gmail.com</a>.</p>
      <p>© 2025 Sri Venkateswara Agros and Herbs. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;
};

const welcomeEmail = async (name, to, subject) => {
    try {
        const htmlTemplate = welcomeTemplate(name, to);
        await transporter.sendMail({
            from: `Sri Venkateswara Agros and Herbs <${process.env.NODEMAILER_USER_EMAIL}>`,
            to,
            subject,
            html: htmlTemplate,
        });
        console.log("Email sent successfully to:", to);
    } catch (error) {
        console.log("Error sending email:", error);
        throw error;
    }
};

export default welcomeEmail;
