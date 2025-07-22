import emailjs from '@emailjs/browser';

export const sendPredictionEmail = async (to_email, user_name, prediction_text) => {
  try {
    const result = await emailjs.send(
      'service_vrlm1p4',
      'template_4fatds4',
      {
        to_email,
        user_name,
        prediction_text
      },
      'OhcGaiZTHJFqEZ5xw'       
    );
    console.log('Email sent!', result.text);
    return true;
  } catch (error) {
    console.error('Email sending failed:', error);
    return false;
  }
};
