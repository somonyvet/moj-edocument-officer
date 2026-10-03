import * as admin from "firebase-admin";
import { Change, EventContext } from "firebase-functions/v1";
import { IInvoiceItems, IAdjustmentItems } from "../interfaces/inventory";
import { ADJUSTMENT_TYPES_OBJ, LINE_TYPE_OBJECT, MOVEMENT_STATUS_OBJ } from "../services/data";
import { pushToObject, pageKey, formatMoney, toNumber, sum, generateRefNo } from "../services/mapping";

export function stock_in_released(change: Change<admin.firestore.DocumentSnapshot>, context: EventContext) {
  const doc: any = change.after.data();
  const id = change.after.id;
  const item: IInvoiceItems = doc;
  if (item.movementStatus.key === MOVEMENT_STATUS_OBJ.HOLD.key) return;
  if (item.lineType && item.lineType.key === LINE_TYPE_OBJECT.SPECIAL.key) return;
  const db = admin.firestore();
  const { productKey, product, total, branch, movementType } = item;
  const stockQty = toNumber(formatMoney(item.stockQty || 0));

  const stockMovementRef = db.collection("stock_movements").doc(id)
  const branchRef = db.collection("stock_visa")
  const productHQRef = db.collection('products').doc(productKey);

  return db.runTransaction(async transaction => {
    const productData = await transaction.get(productHQRef);

    const stockRef = branchRef.doc(branch.key).collection('products').doc(productKey);
    const stockByBranch = await transaction.get(stockRef)
    const stock = pushToObject(stockByBranch);
    const stockBalance = toNumber(formatMoney(stockByBranch.exists ? stock.stockBalance || 0 : 0));
    const newBalance = stockBalance + (stockQty * movementType.factor);
    const productHQ = pushToObject(productData);
    const stockBalanceHQ = productData.exists ? productHQ.stockBalance || 0 : 0;
    const newBalanceHQ = stockBalanceHQ + (stockQty * movementType.factor);
    let avgHQ = productData.exists ? productHQ.avg || 0 : 0;
    const movement = {
      ...doc,
      previousBalance: stockBalance,
      stockBalance: newBalance,
      movementType,
    }
    const productDoc = {
      ...product,
      key: productKey,
      previousBalance: stockBalance,
      stockBalance: newBalance,
    }
    if (movementType.factor > 0) {
      const avg = stockByBranch.exists ? stock.avg || 0 : 0;
      const previousTotalBalance = stockBalance * avg;
      const newAvg = (previousTotalBalance + total) / (stockBalance + stockQty);
      movement.avg = newAvg;
      movement.previousAvg = avg;
      productDoc.avg = newAvg;
      productDoc.previousAvg = avg;
      avgHQ = ((stockBalanceHQ * avgHQ) + total) / (stockBalanceHQ + stockQty);
    }
    transaction.set(productHQRef, { avg: avgHQ, stockBalance: newBalanceHQ }, { merge: true })
    transaction.set(stockRef, productDoc, { merge: true })
    transaction.set(stockRef.collection('product_movements').doc(movement.key), movement, { merge: true })
    return transaction.set(stockMovementRef, movement, { merge: true })
  });
}

export function inventory_Invoice_cut_stock(change: Change<admin.firestore.DocumentSnapshot>, context: EventContext) {
  const doc: any = change.after.data();
  const { course, campus, headerRef, create_by, received_by, student } = doc;
  const { items, qty, totalPrice, storeKey, movementType, movementStatus, lineType } = course

  const db = admin.firestore();
  const studentInvoiceRef = db.collection("students").doc(doc.student.key).collection("invoices").doc(doc.key);
  const storeRef = db.collection("stores").doc(storeKey);
  const stockMovementRef = storeRef.collection("stock_movements")
  const productMovementRef = storeRef.collection("branches").doc(campus.key).collection('products');

  return db.runTransaction(async transaction => {
    if (items && items.length > 0) {
      const pricePerUnit = totalPrice / (sum(items, 'qty') * qty)

      items.map((m: any) => {
        // const productDoc = await transaction.get(storeRef.collection("branches").doc(campus.key).collection("products").doc(m.productKey));
        // const productData: any = pushToObject(productDoc);
        // const avg = productData ? productData.avg : m.avg;
        const avg = m.avg;
        const stockQty = m.qty * qty;
        const item: IAdjustmentItems = {
          headerKey: headerRef,
          student: student,
          key: m.key,
          page_key: pageKey(),
          productKey: m.productKey,
          product: m.product,
          unitSale: m.unitStock,
          qty: stockQty,
          saleQty: stockQty,
          stockQty: stockQty * movementType.factor,

          totalCost: avg * stockQty,
          cost: avg,
          price: avg,
          sellingPrice: pricePerUnit,
          totalSale: stockQty * pricePerUnit,
          total: stockQty * pricePerUnit,
          storeKey: storeKey,
          movementStatus: movementStatus,
          lineType: lineType,
          movementType: movementType,

          campusKey: campus.key,
          branch: { key: campus.key, name: campus.name },
          created_date: new Date(),
          created_by: create_by.key,
          receive_byKey: received_by.key,
        }

        transaction.set(stockMovementRef.doc(item.key), item);
        transaction.set(productMovementRef.doc(m.productKey).collection("product_movements").doc(item.key), item);
        transaction.update(storeRef.collection("products").doc(m.productKey), { stockBalance: admin.firestore.FieldValue.increment(-stockQty) })
        transaction.update(storeRef.collection("branches").doc(campus.key).collection("products").doc(m.productKey), { stockBalance: admin.firestore.FieldValue.increment(-stockQty) })
      })

      transaction.update(studentInvoiceRef, { is_cut_stock: true })
    } else return;
  });
}

export function inventory_Invoice_void_stock(change: Change<admin.firestore.DocumentSnapshot>, context: EventContext) {
  const doc: any = change.after.data();
  const { course, campus, headerRef, create_by, received_by, student } = doc;
  const { items, qty, totalPrice, storeKey, movementStatus, lineType } = course

  const db = admin.firestore();
  const studentInvoiceRef = db.collection("students").doc(doc.student.key).collection("invoices").doc(doc.key);
  const storeRef = db.collection("stores").doc(storeKey);
  const stockMovementRef = storeRef.collection("stock_movements")
  const productMovementRef = storeRef.collection("branches").doc(campus.key).collection('products');

  return db.runTransaction(async transaction => {
    if (items && items.length > 0) {
      const pricePerUnit = totalPrice / (sum(items, 'qty') * qty)

      items.map((m: any) => {
        // const productDoc = await transaction.get(storeRef.collection("branches").doc(campus.key).collection("products").doc(m.productKey));
        // const productData: any = pushToObject(productDoc);
        // const avg = productData ? productData.avg : m.avg;
        const avg = m.avg;
        const stockQty = m.qty * qty;
        const item: IAdjustmentItems = {
          headerKey: headerRef,
          student: student,
          key: m.key,
          page_key: pageKey(),
          productKey: m.productKey,
          product: m.product,
          unitSale: m.unitStock,
          qty: stockQty,
          saleQty: stockQty,
          stockQty: stockQty * ADJUSTMENT_TYPES_OBJ.void.factor,

          totalCost: avg * stockQty,
          cost: avg,
          price: avg,
          sellingPrice: pricePerUnit,
          totalSale: stockQty * pricePerUnit,
          total: stockQty * pricePerUnit,
          storeKey: storeKey,
          movementStatus: movementStatus,
          lineType: lineType,
          movementType: ADJUSTMENT_TYPES_OBJ.void,

          campusKey: campus.key,
          branch: { key: campus.key, name: campus.name },
          created_date: new Date(),
          created_by: create_by.key,
          receive_byKey: received_by.key,
        }

        transaction.set(stockMovementRef.doc(item.key), item);
        transaction.set(productMovementRef.doc(m.productKey).collection("product_movements").doc(item.key), item);
        transaction.update(storeRef.collection("products").doc(m.productKey), { stockBalance: admin.firestore.FieldValue.increment(stockQty) })
        transaction.update(storeRef.collection("branches").doc(campus.key).collection("products").doc(m.productKey), { stockBalance: admin.firestore.FieldValue.increment(stockQty) })
      })

      transaction.update(studentInvoiceRef, { is_cut_stock: true })
    } else return;
  });
}

export function inventory_transfer_created(change: admin.firestore.DocumentSnapshot, context: EventContext) {
  const doc: any = change.data();
  const id = change.id;
  const db = admin.firestore();
  const { storeKey } = doc;
  const storeRef = db.collection("stores").doc(storeKey);
  const headerRef = storeRef.collection("stock_transfers").doc(id)
  const configRef = storeRef.collection('sys_config').doc('general');
  return db.runTransaction(async transaction => {
    const configData = await transaction.get(configRef);
    const config: any = configData.data();
    const tranRefNo = generateRefNo(config.stock_transfer, 'T');
    transaction.update(configRef, { stock_transfer: admin.firestore.FieldValue.increment(1) })
    return transaction.set(headerRef, { tranRefNo: tranRefNo }, { merge: true })
  })
}

export function inventory_transfer_in_created(change: admin.firestore.DocumentSnapshot, context: EventContext) {
  const doc: any = change.data();
  const id = change.id;
  const db = admin.firestore();
  const { storeKey } = doc;
  const storeRef = db.collection("stores").doc(storeKey);
  const headerRef = storeRef.collection("stock_transfer_in").doc(id)
  const configRef = storeRef.collection('sys_config').doc('general');
  return db.runTransaction(async transaction => {
    const configData = await transaction.get(configRef);
    const config: any = configData.data();
    const tranRefNo = generateRefNo(config.stock_transfer_in, 'T');
    transaction.update(configRef, { stock_transfer_in: admin.firestore.FieldValue.increment(1) })
    return transaction.set(headerRef, { tranRefNo: tranRefNo }, { merge: true })
  })
}

export function inventory_adjustment_created(change: admin.firestore.DocumentSnapshot, context: EventContext) {
  const id = change.id;
  const db = admin.firestore();
  const adjustmentHeaderRef = db.collection("stock_adjustments").doc(id)
  const configRef = db.collection('settings').doc('config');
  return db.runTransaction(async transaction => {
    const configData = await transaction.get(configRef);
    const config: any = configData.data();
    const tranRefNo = generateRefNo(config.stock_adjustment, 'A');
    transaction.update(configRef, { stock_adjustment: admin.firestore.FieldValue.increment(1) })
    return transaction.set(adjustmentHeaderRef, { tranRefNo: tranRefNo }, { merge: true })
  })
}

export function bill_created(change: admin.firestore.DocumentSnapshot, context: EventContext) {
  const doc: any = change.data();
  const id = change.id;
  const db = admin.firestore();
  const { storeKey } = doc;
  const storeRef = db.collection("stores").doc(storeKey);
  const adjustmentHeaderRef = storeRef.collection("bills").doc(id)
  const configRef = storeRef.collection('sys_config').doc('general');
  return db.runTransaction(async transaction => {
    const configData = await transaction.get(configRef);
    const config: any = configData.data();
    const tranRefNo = generateRefNo(config.bills);
    transaction.update(configRef, { bills: admin.firestore.FieldValue.increment(1) })
    return transaction.set(adjustmentHeaderRef, { tranRefNo: tranRefNo }, { merge: true })
  })

}

export function receiveStock_created(change: admin.firestore.DocumentSnapshot, context: EventContext) {
  const doc: any = change.data();
  const id = change.id;
  const db = admin.firestore();
  const { storeKey } = doc;
  const storeRef = db.collection("stores").doc(storeKey);
  const adjustmentHeaderRef = storeRef.collection("stock_receive").doc(id)
  const configRef = storeRef.collection('sys_config').doc('general');
  return db.runTransaction(async transaction => {
    const configData = await transaction.get(configRef);
    const config: any = configData.data();
    const tranRefNo = generateRefNo(config.stock_receive);
    transaction.update(configRef, { stock_receive: admin.firestore.FieldValue.increment(1) })
    return transaction.set(adjustmentHeaderRef, { tranRefNo: tranRefNo }, { merge: true })
  })

}
