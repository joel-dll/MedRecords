const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { v4: uuidv4 } = require("uuid");

admin.initializeApp();
const db = admin.firestore();


exports.createSecureShareToken = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "User must be logged in.");
  }

  const { filePath, email } = data;

  if (!filePath || !email) {
    throw new functions.https.HttpsError("invalid-argument", "Missing file path or email.");
  }

  const token = uuidv4();
  const expiresAt = admin.firestore.Timestamp.fromDate(new Date(Date.now() + 15 * 60 * 1000)); // 15 mins

  await db.collection("secureTokens").add({
    token,
    filePath,
    allowedEmail: email,
    createdBy: context.auth.uid,
    createdAt: admin.firestore.Timestamp.now(),
    expiresAt,
  });

  return token;
});


exports.secureFileAccess = functions.https.onRequest(async (req, res) => {
  const { token, email } = req.query;

  if (!token || !email) {
    return res.status(400).send("Missing token or email.");
  }

  try {
    const snapshot = await admin.firestore()
      .collection("secureTokens")
      .where("token", "==", token)
      .where("allowedEmail", "==", email)
      .limit(1)
      .get();

    if (snapshot.empty) return res.status(403).send("Invalid or expired token.");

    const tokenDoc = snapshot.docs[0].data();

    if (tokenDoc.expiresAt.toDate() < new Date()) {
      return res.status(403).send("Token expired.");
    }

    
    const bucket = admin.storage().bucket('medrecords-e9eed');
    const file = bucket.file(tokenDoc.filePath);

    const [url] = await file.getSignedUrl({
      action: "read",
      expires: Date.now() + 60 * 60 * 1000, 
    });

    return res.redirect(url);
  } catch (err) {
    console.error("Error generating signed URL:", err);
    return res.status(500).send("Failed to generate signed URL.");
  }
});
