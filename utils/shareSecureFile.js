import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db, auth } from '../app/lib/firebase';
import { v4 as uuidv4 } from 'uuid';

export const createSecureShareToken = async (filePath, recipientEmail) => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not logged in');

  const token = uuidv4();
  const expiresAt = Timestamp.fromDate(new Date(Date.now() + 60 * 60 * 1000)); 

  await addDoc(collection(db, 'secureTokens'), {
    token,
    filePath,
    allowedEmail: recipientEmail,
    createdBy: user.uid,
    createdAt: Timestamp.now(),
    expiresAt,
  });

  
  const shareURL = `https://securefileaccess-7dlwc35l3a-uc.a.run.app/?token=${token}&email=${recipientEmail}`;
  return shareURL;
};


