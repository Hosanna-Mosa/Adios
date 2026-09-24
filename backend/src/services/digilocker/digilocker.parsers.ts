import { parseXml, findFirst, attr, value } from "../../utils/xml";
import {
  DigiLockerAadhaarData,
  DigiLockerDrivingLicenceData,
  DigiLockerPanData,
} from "./digilocker.types";

/**
 * Normalisers for DigiLocker's issued-document XML.
 *
 * Issuers are not consistent about where a field lives (root attribute vs a
 * nested KYC element vs child text), so each getter tries the known shapes in
 * order. Everything is optional — a missing field yields `undefined` rather
 * than throwing, and the caller decides whether the result is good enough.
 */

/** DigiLocker emits DOB as DDMMYYYY, DD-MM-YYYY or YYYY-MM-DD. Normalise to DD-MM-YYYY. */
export function normaliseDob(raw?: string): string | undefined {
  if (!raw) return undefined;
  const cleaned = raw.trim();

  if (/^\d{8}$/.test(cleaned)) {
    return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 4)}-${cleaned.slice(4)}`;
  }

  const iso = cleaned.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[3]}-${iso[2]}-${iso[1]}`;

  const dmy = cleaned.match(/^(\d{2})[-/](\d{2})[-/](\d{4})$/);
  if (dmy) return `${dmy[1]}-${dmy[2]}-${dmy[3]}`;

  return cleaned;
}

/** Map the many gender spellings DigiLocker issuers use onto M / F / T. */
export function normaliseGender(raw?: string): string | undefined {
  if (!raw) return undefined;
  const first = raw.trim().toUpperCase().charAt(0);
  return ["M", "F", "T"].includes(first) ? first : raw.trim().toUpperCase();
}

/**
 * Mask an Aadhaar number to its last four digits.
 * DigiLocker normally masks already; this guards the cases where a field
 * carries the full number, so we never persist all 12 digits.
 */
export function maskAadhaar(raw?: string): string | undefined {
  if (!raw) return undefined;
  const digits = raw.replace(/\D/g, "");
  if (digits.length < 4) return raw.trim();
  return `XXXXXXXX${digits.slice(-4)}`;
}

/** Parse DigiLocker's eAadhaar XML into our normalised Aadhaar shape. */
export function parseAadhaarXml(xml: string): DigiLockerAadhaarData {
  const root = parseXml(xml);
  if (!root) return {};

  // Preferred source is the UIDAI KYC block; fall back to the certificate envelope.
  const poi = findFirst(root, "Poi");
  const poa = findFirst(root, "Poa");
  const uidData = findFirst(root, "UidData");
  const person = findFirst(root, "Person");
  const address = findFirst(root, "Address");

  const name = attr(poi, "name") || attr(person, "name") || attr(root, "name");
  const dob = normaliseDob(attr(poi, "dob", "dateOfBirth") || attr(person, "dob", "dateOfBirth"));
  const gender = normaliseGender(attr(poi, "gender") || attr(person, "gender"));

  const rawUid =
    attr(uidData, "uid") || attr(person, "uid", "aadhaar", "number") || attr(root, "number");

  const addressSource = poa || address;
  const parts = {
    house: attr(addressSource, "house", "building"),
    street: attr(addressSource, "street"),
    landmark: attr(addressSource, "landmark", "lm"),
    locality: attr(addressSource, "loc", "locality"),
    vtc: attr(addressSource, "vtc", "city", "town"),
    subDistrict: attr(addressSource, "subdist", "subDistrict"),
    district: attr(addressSource, "dist", "district"),
    state: attr(addressSource, "state"),
    pincode: attr(addressSource, "pc", "pincode", "pin"),
    country: attr(addressSource, "country"),
  };

  const full = [
    parts.house,
    parts.street,
    parts.landmark,
    parts.locality,
    parts.vtc,
    parts.subDistrict,
    parts.district,
    parts.state,
    parts.pincode,
    parts.country,
  ]
    .filter(Boolean)
    .join(", ");

  const photo = findFirst(root, "Pht");

  return {
    name,
    dob,
    gender,
    maskedAadhaarNumber: maskAadhaar(rawUid),
    careOf: attr(addressSource, "careof", "co"),
    address: full ? { ...parts, full } : undefined,
    photoBase64: photo?.text || undefined,
    issuedAt: attr(root, "issueDate", "issuedAt"),
  };
}

/** Parse DigiLocker's PAN certificate XML into our normalised PAN shape. */
export function parsePanXml(xml: string): DigiLockerPanData {
  const root = parseXml(xml);
  if (!root) return {};

  const panBlock = findFirst(root, "PAN");
  const person = findFirst(root, "Person");

  const panNumber =
    value(panBlock, "num", "number", "pan") ||
    attr(person, "pan", "number") ||
    attr(root, "number");

  const name = value(panBlock, "name") || attr(person, "name") || attr(root, "name");

  return {
    panNumber: panNumber ? panNumber.trim().toUpperCase() : undefined,
    name: name?.trim(),
    fatherName: value(panBlock, "fathersName", "fatherName", "father"),
    dob: normaliseDob(value(panBlock, "dob") || attr(person, "dob")),
    gender: normaliseGender(attr(person, "gender")),
    issuedAt: attr(root, "issueDate", "issuedAt"),
  };
}

/** Validate a PAN against the statutory AAAAA9999A format. */
export function isValidPanFormat(pan?: string): boolean {
  if (!pan) return false;
  return /^[A-Z]{5}\d{4}[A-Z]$/.test(pan.trim().toUpperCase());
}

/**
 * Parse DigiLocker's driving-licence XML.
 *
 * State transport departments are the least consistent issuers on DigiLocker —
 * the number can be `number`, `dlNumber` or the certificate's own attribute,
 * and validity may be a `validTill` attribute or a nested <Validity> element
 * with separate transport / non-transport dates. Every getter below tries the
 * shapes seen in the wild and falls back rather than throwing.
 */
export function parseDrivingLicenceXml(xml: string): DigiLockerDrivingLicenceData {
  const root = parseXml(xml);
  if (!root) return {};

  const dlBlock = findFirst(root, "DrivingLicense") || findFirst(root, "DrivingLicence");
  const person = findFirst(root, "Person");
  const validity = findFirst(root, "Validity");
  const organisation = findFirst(root, "Organization") || findFirst(root, "Organisation");

  const licenceNumber =
    attr(dlBlock, "number", "dlNumber", "dlno") ||
    value(dlBlock, "number", "dlNumber") ||
    attr(root, "number");

  // A transport-class expiry is the binding one for commercial driving, so
  // prefer it when both are present.
  const rawValidTill =
    attr(validity, "transport", "toDate", "validTill") ||
    attr(validity, "nonTransport", "nonTransportValidTill") ||
    attr(dlBlock, "validTill", "validTo", "expiryDate", "doe") ||
    value(dlBlock, "validTill", "expiryDate");

  return {
    licenceNumber: licenceNumber ? licenceNumber.trim().toUpperCase() : undefined,
    name: attr(person, "name") || attr(root, "name"),
    dob: normaliseDob(attr(person, "dob", "dateOfBirth")),
    validTill: normaliseDob(rawValidTill),
    vehicleClass:
      attr(dlBlock, "vehicleClass", "cov", "classOfVehicle") ||
      value(dlBlock, "vehicleClass", "cov"),
    issuedBy: attr(organisation, "name"),
    issuedAt: attr(root, "issueDate", "issuedAt"),
  };
}

/**
 * Convert a DD-MM-YYYY string (what the parsers emit) into a Date.
 * Returns undefined for anything unparseable rather than an Invalid Date.
 */
export function toDate(ddmmyyyy?: string): Date | undefined {
  if (!ddmmyyyy) return undefined;

  const match = ddmmyyyy.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (!match) return undefined;

  // Midday UTC keeps the calendar date stable across timezone conversions.
  const date = new Date(Date.UTC(Number(match[3]), Number(match[2]) - 1, Number(match[1]), 12));
  return Number.isNaN(date.getTime()) ? undefined : date;
}

/** Indian driving licence numbers are state-prefixed and 15-16 chars. */
export function isValidLicenceFormat(licence?: string): boolean {
  if (!licence) return false;
  const cleaned = licence.replace(/[\s-]/g, "").toUpperCase();
  return /^[A-Z]{2}\d{11,13}$/.test(cleaned);
}
