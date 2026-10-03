import * as admin from "firebase-admin";
import { Change, EventContext } from "firebase-functions/lib/cloud-functions";

export function _onDocumentViewStatisticChanged(change: Change<admin.firestore.DocumentSnapshot>, context: EventContext) {
  const { headerKey } = context.params
  const db = admin.firestore();
  const headerRef = db.collection('documents_header').doc(headerKey)
  const doc = change.after.data() || change.before.data();
  return admin.firestore().runTransaction(async transaction => {
    if (!change.before.exists && change.after.exists) {
      transaction.set(headerRef, {
        total_visitor: admin.firestore.FieldValue.increment(1),
        visitor_keys: admin.firestore.FieldValue.arrayUnion(doc?.key)
      }, { merge: true });
    }
    return transaction.set(headerRef, { total_view: admin.firestore.FieldValue.increment(1) }, { merge: true });
  })
}

export function _onDocumentCommentStatisticChanged(change: Change<admin.firestore.DocumentSnapshot>, context: EventContext) {
  const { headerKey } = context.params
  const db = admin.firestore();
  const headerRef = db.collection('documents_header').doc(headerKey)
  return admin.firestore().runTransaction(async transaction => {
    if (!change.before.exists || (change.before.exists && change.after.exists)) {
      const { status } = change.after.data() as any;
      if (status?.key === -1)
        transaction.set(headerRef, { total_comments: admin.firestore.FieldValue.increment(-1) }, { merge: true });
      else
        transaction.set(headerRef, { total_comments: admin.firestore.FieldValue.increment(1) }, { merge: true });

    } else if (!change.after.exists) {
      const { status } = change.before.data() as any;
      if (status.key === 1)
        transaction.set(headerRef, { total_comments: admin.firestore.FieldValue.increment(-1) }, { merge: true });
    }
    return null;
  })
}
