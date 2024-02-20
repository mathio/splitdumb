export const sendEmailViaBrevo = async (
  sender: { name: string; email: string },
  email: string,
  subject: string,
  htmlContent: string,
) => {
  const result = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/json",
      "api-key": process.env.BREVO_EMAIL_API_KEY,
    },
    body: JSON.stringify({
      sender,
      to: [{ email }],
      subject,
      htmlContent,
    }),
  });
  return result.json();
};
