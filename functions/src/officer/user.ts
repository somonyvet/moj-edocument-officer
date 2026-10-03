import * as admin from "firebase-admin";
import { Change, EventContext } from "firebase-functions/lib/cloud-functions";

export function _onCreateUserAccount(change: Change<admin.firestore.DocumentSnapshot>, context: EventContext) {
  const doc: any = change.after.data() || change.before.data();
  const key: string = change.after.id || change.before.id;
  const { email, displayName, file, fromForm } = doc;
  const url = file?.downloadUrl || 'https://firebasestorage.googleapis.com/v0/b/school-link-bb0e9.appspot.com/o/no_avatar%2Fnoprofile.jpg?alt=media&token=083c033f-96b4-483c-beb6-1603b14dc44b';
  if (!change.before.exists && change.after.exists) {
    if (fromForm) {
      return null;
    }
    const auth = {
      email: email,
      password: `016555392`,
      displayName: displayName,
      disabled: false,
      emailVerified: false,
      photoURL: url,
      uid: key
    }
    return admin.auth().createUser(auth);
  } else if (change.before.exists && change.after.exists) {
    const beforeEmail = change.before.data()?.email || null;
    const afterEmail = change.after.data()?.email || null;
    if (beforeEmail !== afterEmail) {
      return admin.auth().updateUser(key, {
        email: email,
        displayName: displayName,
        photoURL: url,
      });
    }
  } else if (change.before.exists && !change.after.exists) {
    return admin.auth().deleteUser(key);
  }
  return null;
}

export function _onResetCreateUserAccount(change: Change<admin.firestore.DocumentSnapshot>, context: EventContext) {
  const doc: any = change.after.data() || change.before.data();
  const key: string = change.after.id || change.before.id;
  const db = admin.firestore();
  const { email, displayName, file, resetAccount, resetPassword } = doc;
  const url = file?.downloadUrl || 'https://firebasestorage.googleapis.com/v0/b/school-link-bb0e9.appspot.com/o/no_avatar%2Fnoprofile.jpg?alt=media&token=083c033f-96b4-483c-beb6-1603b14dc44b';
  return admin.firestore().runTransaction(async transaction => {

    if (change.before.exists && change.after.exists) {

      if (resetAccount) {
        transaction.update(db.collection("users").doc(key), { resetAccount: false });
        const auth = {
          email: email,
          password: `016555392`,
          displayName: displayName,
          disabled: false,
          emailVerified: false,
          photoURL: url,
          uid: key
        }
        return admin.auth().createUser(auth);
      } else if (resetPassword) {
        return admin.auth().deleteUser(key).then(() => {
          transaction.update(db.collection("users").doc(key), { resetPassword: false });
          const auth = {
            email: email,
            password: `016555392`,
            displayName: displayName,
            disabled: false,
            emailVerified: false,
            photoURL: url,
            uid: key
          }
          return admin.auth().createUser(auth);
        });
      } else return null
    } else return null
  })
}
