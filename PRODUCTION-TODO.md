# Production TODO — criminal-letter (prod) rollout

Everything below is currently only set up in **dev** (`criminal-letter-test`).
Production project is **`criminal-letter`** (`.firebaserc` → `projects.default`).

Nothing in this list is done automatically by `ng build` / `firebase deploy --only hosting`.
Work top to bottom: config → functions → indexes → data → app.

---

## 1. Environment / Firebase project

- [ ] `src/environments/environment.prod.ts` still points at **`criminal-letter-test`**.
      The prod credentials are the commented-out block in the same file (`criminal-letter`,
      `567154187005`, …). Uncomment those and delete the test block **before building prod**.
      Do the same check on `src/environments/environment.ts` if it is used for a prod build.
- [ ] `firebase.json` → `hosting[0].site` is `officer-criminal-letter-dev`. Add the prod
      hosting site (or a second hosting target) and a matching `targets` entry in `.firebaserc`
      for the `criminal-letter` project. Do not deploy prod onto the dev site.
- [ ] Confirm you deploy with the prod project explicitly: `firebase use default` /
      `firebase deploy -P default …`, so nothing lands on `criminal-letter-test` by mistake.

## 2. Cloud Functions to deploy (new in this work)

New/changed sources: `functions/src/criminal/criminal-approval.module.ts`,
`criminal-letter.module.ts`, `criminal-verify.mapping.ts`, `criminal-verify.service.ts`, `criminal-verify.oa.ts`,
`functions/src/services/data.ts`, `functions/src/index.ts`.

- [ ] Deploy the new trigger `onCriminalRecordFinalApproval`
      (`criminal_record/{key}` `onWrite`) — `firebase deploy --only functions:onCriminalRecordFinalApproval`.
- [ ] Redeploy `onCriminalRecordApplyByCitizen` (its module changed).
- [ ] Verify the deployed **region** matches the existing functions (`asia-east2` is the
      default assumed by `criminal-verify.service.ts`).

### 2a. Verify-system (OA) issuing — external HTTP dependency

`onCriminalRecordFinalApproval` issues every document of the record itself, right after the
approval transaction commits (`issueToVerify` → `criminal-verify.service.ts`), posting to
**`https://verify.moj.gov.kh/oa`**:

1. `/api/generate` — body built by `mapVerifyOa` (`criminal-verify.oa.ts`), answers with the OA
   key, the verify url and the QR image;
2. `/api/issue` — keyed by our own `document_verify.key`, **carrying the +90 day `expires_at`**.

That second call is enough: the document comes out already carrying the date it stops verifying
on, so nothing calls `/api/expire` during an approval. (`/api/expire` remains behind the
"Set Expire" button and the officer-driven `scan-expire-date` flow, for changing the date later.)

Then the handler writes `verify_key` / `verify_url` / `verify_qr` / `verify_expire_at` onto each
`document_verify` doc and the QR url onto the record (`verify_qr_kh|_en|_fr`). Nothing waits on
the verify codebase's `triggerVerifyOADocument`: each document is created already carrying a
`verify_key`, which is exactly the condition that trigger skips on, so it never double-issues.

- [ ] `criminal-verify.oa.ts` builds the `/api/generate` body straight from the OA server's own
      AJV schema (`document-encryption-server-OA_MPTC/server-config-prod.json`): `data.id` =
      `document_verify.key`, `data.recipient` = the document's display fields + `language`
      (`km|en|fr`), `data.certificate` = `institution` / `institutionKm`. Confirm the two
      institution strings are what the `MOJ_CONDEMNATION_LETTER` renderer should print — they are
      free text in the schema, so a wrong value is accepted and shows up on the bulletin.
- [ ] Confirm the prod OA host is the same `https://verify.moj.gov.kh/oa`. If not:
      `firebase functions:config:set verify.oa_url="https://…"` (then redeploy functions —
      runtime config is read at deploy time).
- [ ] Confirm the endpoint accepts unauthenticated POSTs from Cloud Functions, or add whatever
      credential it expects to `postToUrl` before go-live.
- [ ] `onCriminalRecordFinalApproval` is deployed with `timeoutSeconds: 300` / `512MB` (two OA
      calls plus a QR upload per language). Check the deployed config after the first deploy.
- [ ] Confirm the functions service account may write to the default Storage bucket
      (`verify_qr/{key}.png`) — the QR is uploaded from the function now.
- [ ] Deploy the two debug callables used by the bulletin page's buttons:
      `firebase deploy --only functions:onCallVerifyDocumentStatus,functions:onCallSetVerifyExpire`.
- [ ] On failure the approval itself still completes: `verify_issued: false` and
      `verify_issue_error` land on the record and the failure is visible in the function logs.
      The record's documents can then be inspected with "Get Verify Status" and re-dated with
      "Set Expire" on the digital bulletin page.

## 3. Firestore indexes

New queries need composite indexes; they fail at runtime until the index exists.

- [ ] **Letter 3 general — period tabs** (`criminalRecordsListingByPeriodRef`, new):
      collection `criminal_record`, fields
      `status.key` + `application_type.key` + `urgent_obj.key` + `created_at`
      (the `decree` and `done` tabs use a **range** on `status.key`, so they need their own
      variant with `status.key` ordered first).
      Easiest path: open each tab once in prod, follow the index-creation link in the console
      error, then run `firebase firestore:indexes > firestore.indexes.json` to commit them.
- [ ] Re-check the digital approval listings (`digital_letter1/2/3` menus) the same way —
      those queries are also new in this branch.
- [ ] Deploy the file: `firebase deploy --only firestore:indexes`.

## 4. Firestore data / seeds

- [ ] `settings/{letter1|letter2}` counter docs — created on first use, **but** the prod
      numbering must not start at 1 by accident. Before the first digital approval in prod, set
      `start_no`, `prefix`, `padding`, `include_year`, `year_key` on each doc to continue the
      real letter numbering. Once a number is issued it cannot be taken back.
- [ ] Existing prod `criminal_record` documents have no `document_flow_category` and no
      `urgent_obj`. Decide whether to backfill:
      - records without `document_flow_category.key = digital` are ignored by the new
        approval trigger (safe — old paper flow keeps working);
      - records without `urgent_obj.key` will **not appear** in the letter 3 general
        ១២ថ្ងៃ / ២០ថ្ងៃ tabs, because those tabs now query on that field.
- [ ] `firestore.rules` — confirm the rules deployed to prod cover `settings` and
      `document_verify` writes made by the new trigger (it writes as admin, but client reads
      of `document_verify` matter for the verify page).

## 5. App config / menus

- [ ] `src/app/dummy/config.ts`: the old `decree` sub-menus (`review`, `mol`, `assistant`,
      `approved`) and the old `approval_folder` items (`12Day`, `20Day`, `urgent`, `workers`,
      `approved`) are **commented out** and replaced by the new letter1/2/3/3-mol/3-general and
      `digital_letter1/2/3` menus. Confirm this is what prod users should see, or restore the
      old entries for a phased rollout.
- [ ] Officer permissions: the new menus reuse `judgment_list_office` and `approval`.
      Check that the prod officer/role records actually carry those permission keys, otherwise
      the menus will be hidden.
- [ ] Bump the app version / cache-buster used for the "new version" prompt before deploying.

## 6. Smoke test in prod after deploy

- [ ] `/criminal-record/decree-record/application/letter3-general/decree` redirects to
      `…/decree/period12` and both period tabs load and page (scroll to bottom).
- [ ] Same for `reviewed` and `done`.
- [ ] One end-to-end digital approval: last workplace approves → record gets
      `status = APPROVED`, `letter_no`, expiry (+90 days / 3 months), notification, and the
      verify QR resolves on the public verify page.
- [ ] Check function logs for `verify OA issuing failed` right after that test, and
      confirm each `document_verify` doc got `verify_key`, `verify_url`, `verify_qr` and
      `verify_expire_at`, that the record carries `verify_issued: true`, and that the verify page
      shows the +90 day expiry.


## 7. Add field to setting 
-     criminal_record_category_business