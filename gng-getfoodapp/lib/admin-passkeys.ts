import { getAirtableBase } from "@/lib/airtable";
import { escapeAirtableString, getNumberField, getStringField } from "@/lib/airtable-fields";

export type StoredPasskey = {
  id: string;
  email: string;
  credentialId: string;
  publicKey: string;
  counter: number;
  transports: string[];
};

export function getAdminPasskeysTableName() {
  return process.env.AIRTABLE_ADMIN_PASSKEYS_TABLE_NAME || "Admin Passkeys";
}

function getCredentialIdField() {
  return process.env.AIRTABLE_PASSKEY_CREDENTIAL_ID_FIELD || "Credential ID";
}

function getPublicKeyField() {
  return process.env.AIRTABLE_PASSKEY_PUBLIC_KEY_FIELD || "Public Key";
}

function getCounterField() {
  return process.env.AIRTABLE_PASSKEY_COUNTER_FIELD || "Counter";
}

function getEmailField() {
  return process.env.AIRTABLE_PASSKEY_EMAIL_FIELD || "Email";
}

function getTransportsField() {
  return process.env.AIRTABLE_PASSKEY_TRANSPORTS_FIELD || "Transports";
}

function mapPasskeyRecord(input: {
  id: string;
  fields: Record<string, unknown>;
}): StoredPasskey | null {
  const f = input.fields;
  const credentialId = getStringField(f, getCredentialIdField());
  const publicKey = getStringField(f, getPublicKeyField());
  const email = getStringField(f, getEmailField());
  if (!credentialId || !publicKey || !email) return null;

  const transportsRaw = getStringField(f, getTransportsField());
  const transports = transportsRaw
    ? transportsRaw.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  return {
    id: input.id,
    email: email.toLowerCase(),
    credentialId,
    publicKey,
    counter: getNumberField(f, getCounterField()) ?? 0,
    transports,
  };
}

export async function listPasskeysForEmail(
  email: string
): Promise<StoredPasskey[]> {
  const normalized = email.trim().toLowerCase();
  const base = getAirtableBase();
  const tableName = getAdminPasskeysTableName();
  const emailField = getEmailField();

  const records = await base(tableName)
    .select({
      filterByFormula: `LOWER({${emailField}}) = '${escapeAirtableString(normalized)}'`,
    })
    .all();

  return records
    .map((record) =>
      mapPasskeyRecord({
        id: record.id,
        fields: (record.fields || {}) as Record<string, unknown>,
      })
    )
    .filter((passkey): passkey is StoredPasskey => passkey !== null);
}

export async function listAllPasskeys(): Promise<StoredPasskey[]> {
  const base = getAirtableBase();
  const tableName = getAdminPasskeysTableName();

  const records = await base(tableName).select().all();

  return records
    .map((record) =>
      mapPasskeyRecord({
        id: record.id,
        fields: (record.fields || {}) as Record<string, unknown>,
      })
    )
    .filter((passkey): passkey is StoredPasskey => passkey !== null);
}

export async function findPasskeyByCredentialId(
  credentialId: string
): Promise<StoredPasskey | null> {
  const base = getAirtableBase();
  const tableName = getAdminPasskeysTableName();
  const credentialField = getCredentialIdField();

  const records = await base(tableName)
    .select({
      filterByFormula: `{${credentialField}} = '${escapeAirtableString(credentialId)}'`,
      maxRecords: 1,
    })
    .firstPage();

  const record = records[0];
  if (!record) return null;

  return mapPasskeyRecord({
    id: record.id,
    fields: (record.fields || {}) as Record<string, unknown>,
  });
}

export async function createPasskey(input: {
  email: string;
  credentialId: string;
  publicKey: string;
  counter: number;
  transports?: string[];
}) {
  const base = getAirtableBase();
  const tableName = getAdminPasskeysTableName();

  const record = await base(tableName).create({
    [getEmailField()]: input.email.trim().toLowerCase(),
    [getCredentialIdField()]: input.credentialId,
    [getPublicKeyField()]: input.publicKey,
    [getCounterField()]: input.counter,
    [getTransportsField()]: (input.transports ?? []).join(","),
  });

  const passkey = mapPasskeyRecord({
    id: record.id,
    fields: (record.fields || {}) as Record<string, unknown>,
  });
  if (!passkey) {
    throw new Error("Passkey was saved but could not be read back.");
  }
  return passkey;
}

export async function updatePasskeyCounter(recordId: string, counter: number) {
  const base = getAirtableBase();
  const tableName = getAdminPasskeysTableName();
  await base(tableName).update(recordId, {
    [getCounterField()]: counter,
  });
}

export async function adminHasPasskey(email: string): Promise<boolean> {
  const passkeys = await listPasskeysForEmail(email);
  return passkeys.length > 0;
}
