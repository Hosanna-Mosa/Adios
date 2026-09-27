import { DigiLockerDocType, DigiLockerIssuedDocument } from "./digilocker.types";

/**
 * Sandbox test personas.
 *
 * Each persona models a different real-world DigiLocker account state so the
 * unhappy paths are reachable without waiting for a live account to misbehave:
 * a fully-documented user, a user with no PAN issued, and a user whose account
 * has no eAadhaar linked. All identifiers below are deliberately invalid for
 * real systems (reserved/test ranges), so nothing here can collide with a real
 * Aadhaar or PAN.
 */

export interface SandboxPersona {
  id: string;
  label: string;
  description: string;
  digilockerId: string;
  name: string;
  /** DDMMYYYY, matching DigiLocker's token payload format. */
  dob: string;
  gender: "M" | "F" | "T";
  mobile: string;
  eaadhaar: boolean;
  maskedAadhaar: string;
  pan?: string;
  fatherName?: string;
  address: {
    careOf?: string;
    house: string;
    street: string;
    landmark?: string;
    locality?: string;
    vtc: string;
    subDistrict?: string;
    district: string;
    state: string;
    pincode: string;
    country: string;
  };
  drivingLicence?: {
    number: string;
    validTill: string;
    vehicleClass: string;
  };
}

export const SANDBOX_PERSONAS: SandboxPersona[] = [
  {
    id: "complete",
    label: "Fully verified driver",
    description: "Aadhaar + PAN + driving licence all issued. The happy path.",
    digilockerId: "8e2f1c44-0000-4a1b-9c3d-000000000001",
    name: "Ravi Teja Nandigam",
    dob: "12101992",
    gender: "M",
    mobile: "9000000001",
    eaadhaar: true,
    maskedAadhaar: "XXXXXXXX4321",
    pan: "ABCDE1234F",
    fatherName: "Ramesh Nandigam",
    address: {
      careOf: "S/O Ramesh Nandigam",
      house: "1-23/4",
      street: "Gandhi Nagar Main Road",
      landmark: "Near SBI Bank",
      locality: "Gandhi Nagar",
      vtc: "Tadepalligudem",
      subDistrict: "Tadepalligudem",
      district: "West Godavari",
      state: "Andhra Pradesh",
      pincode: "534101",
      country: "India",
    },
    drivingLicence: {
      number: "AP37 20110012345",
      validTill: "2031-10-11",
      vehicleClass: "LMV, MCWG",
    },
  },
  {
    id: "no-pan",
    label: "Aadhaar only (no PAN issued)",
    description: "Exercises the 404 document_not_issued path for PAN.",
    digilockerId: "8e2f1c44-0000-4a1b-9c3d-000000000002",
    name: "Lakshmi Priya Vemuri",
    dob: "05061996",
    gender: "F",
    mobile: "9000000002",
    eaadhaar: true,
    maskedAadhaar: "XXXXXXXX8765",
    address: {
      careOf: "D/O Srinivasa Rao Vemuri",
      house: "45-7",
      street: "Church Street",
      locality: "Bhimavaram",
      vtc: "Bhimavaram",
      subDistrict: "Bhimavaram",
      district: "West Godavari",
      state: "Andhra Pradesh",
      pincode: "534202",
      country: "India",
    },
  },
  {
    id: "no-eaadhaar",
    label: "PAN only (no eAadhaar linked)",
    description: "Account exists but has no eAadhaar — Aadhaar fetch must fail cleanly.",
    digilockerId: "8e2f1c44-0000-4a1b-9c3d-000000000003",
    name: "Mohammed Irfan Shaik",
    dob: "23031988",
    gender: "M",
    mobile: "9000000003",
    eaadhaar: false,
    maskedAadhaar: "",
    pan: "ZYXWV9876K",
    fatherName: "Abdul Shaik",
    address: {
      house: "12-3-45",
      street: "Station Road",
      vtc: "Eluru",
      district: "Eluru",
      state: "Andhra Pradesh",
      pincode: "534001",
      country: "India",
    },
  },
];

export const DEFAULT_PERSONA_ID = SANDBOX_PERSONAS[0].id;

export function getPersona(id?: string | null): SandboxPersona {
  return SANDBOX_PERSONAS.find((p) => p.id === id) || SANDBOX_PERSONAS[0];
}

function xmlEscape(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** ISO-ish issue date, stable per persona so repeated fetches match. */
const ISSUE_DATE = "2016-04-18T00:00:00+05:30";

/**
 * Build an eAadhaar XML document in the same shape DigiLocker returns, so the
 * sandbox exercises the real parser rather than handing back a pre-made object.
 */
export function buildAadhaarXml(persona: SandboxPersona): string {
  const a = persona.address;
  const dob = `${persona.dob.slice(0, 2)}-${persona.dob.slice(2, 4)}-${persona.dob.slice(4)}`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<Certificate name="${xmlEscape(persona.name)}" type="AadhaarCard" number="${persona.maskedAadhaar}" issuedAt="${a.state}" issueDate="${ISSUE_DATE}">
  <IssuedBy>
    <Organization name="Unique Identification Authority of India" code="in.gov.uidai"/>
  </IssuedBy>
  <IssuedTo>
    <Person uid="${persona.maskedAadhaar}" name="${xmlEscape(persona.name)}" dob="${dob}" gender="${persona.gender}" phone="XXXXXX${persona.mobile.slice(-4)}"/>
  </IssuedTo>
  <CertificateData>
    <KycRes code="SANDBOX">
      <UidData uid="${persona.maskedAadhaar}">
        <Poi name="${xmlEscape(persona.name)}" dob="${dob}" gender="${persona.gender}" phone="XXXXXX${persona.mobile.slice(-4)}" email=""/>
        <Poa careof="${xmlEscape(a.careOf || "")}" house="${xmlEscape(a.house)}" street="${xmlEscape(a.street)}" landmark="${xmlEscape(a.landmark || "")}" loc="${xmlEscape(a.locality || "")}" vtc="${xmlEscape(a.vtc)}" subdist="${xmlEscape(a.subDistrict || "")}" dist="${xmlEscape(a.district)}" state="${xmlEscape(a.state)}" pc="${a.pincode}" country="${a.country}"/>
        <Pht></Pht>
      </UidData>
    </KycRes>
  </CertificateData>
</Certificate>`;
}

/** Build a PAN certificate XML document in DigiLocker's shape. */
export function buildPanXml(persona: SandboxPersona): string {
  const dob = `${persona.dob.slice(0, 2)}-${persona.dob.slice(2, 4)}-${persona.dob.slice(4)}`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<Certificate type="PANCard" number="${persona.pan}" name="${xmlEscape(persona.name)}" issueDate="${ISSUE_DATE}">
  <IssuedBy>
    <Organization name="Income Tax Department" code="in.gov.pan"/>
  </IssuedBy>
  <IssuedTo>
    <Person name="${xmlEscape(persona.name)}" dob="${dob}" gender="${persona.gender}" pan="${persona.pan}"/>
  </IssuedTo>
  <CertificateData>
    <PAN>
      <name>${xmlEscape(persona.name)}</name>
      <num>${persona.pan}</num>
      <fathersName><![CDATA[${persona.fatherName || ""}]]></fathersName>
      <dob>${dob}</dob>
    </PAN>
  </CertificateData>
</Certificate>`;
}

/** Build a driving-licence XML document in DigiLocker's shape. */
export function buildDrivingLicenceXml(persona: SandboxPersona): string {
  const dl = persona.drivingLicence!;
  const dob = `${persona.dob.slice(0, 2)}-${persona.dob.slice(2, 4)}-${persona.dob.slice(4)}`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<Certificate type="DrivingLicense" number="${dl.number}" name="${xmlEscape(persona.name)}" issueDate="${ISSUE_DATE}">
  <IssuedBy>
    <Organization name="Transport Department, ${xmlEscape(persona.address.state)}" code="in.gov.transport"/>
  </IssuedBy>
  <IssuedTo>
    <Person name="${xmlEscape(persona.name)}" dob="${dob}" gender="${persona.gender}"/>
  </IssuedTo>
  <CertificateData>
    <DrivingLicense number="${dl.number}" validTill="${dl.validTill}" vehicleClass="${dl.vehicleClass}"/>
  </CertificateData>
</Certificate>`;
}

/** The issued-document list DigiLocker would return for this persona. */
export function buildIssuedDocuments(persona: SandboxPersona): DigiLockerIssuedDocument[] {
  const documents: DigiLockerIssuedDocument[] = [];

  if (persona.eaadhaar) {
    documents.push({
      name: "Aadhaar Card",
      uri: `in.gov.uidai-ADHAR-${persona.maskedAadhaar.slice(-4)}`,
      doctype: DigiLockerDocType.AADHAAR,
      description: "Aadhaar Card",
      issuer: "Unique Identification Authority of India",
      issuerId: "in.gov.uidai",
      mime: ["application/pdf", "application/xml"],
      size: "48213",
      date: "18-04-2016",
    });
  }

  if (persona.pan) {
    documents.push({
      name: "PAN Verification Record",
      uri: `in.gov.pan-PANCR-${persona.pan}`,
      doctype: DigiLockerDocType.PAN,
      description: "PAN Verification Record",
      issuer: "Income Tax Department",
      issuerId: "in.gov.pan",
      mime: ["application/pdf", "application/xml"],
      size: "21044",
      date: "02-01-2018",
    });
  }

  if (persona.drivingLicence) {
    documents.push({
      name: "Driving Licence",
      uri: `in.gov.transport-DRVLC-${persona.drivingLicence.number.replace(/\s/g, "")}`,
      doctype: DigiLockerDocType.DRIVING_LICENCE,
      description: "Driving Licence",
      issuer: `Transport Department, ${persona.address.state}`,
      issuerId: "in.gov.transport",
      mime: ["application/pdf", "application/xml"],
      size: "35120",
      date: "11-10-2011",
    });
  }

  return documents;
}

/** Return the XML body for a persona's document URI, or null when not issued. */
export function buildDocumentXml(persona: SandboxPersona, uri: string): string | null {
  const documents = buildIssuedDocuments(persona);
  const match = documents.find((doc) => doc.uri === uri);
  if (!match) return null;

  switch (match.doctype) {
    case DigiLockerDocType.AADHAAR:
      return buildAadhaarXml(persona);
    case DigiLockerDocType.PAN:
      return buildPanXml(persona);
    case DigiLockerDocType.DRIVING_LICENCE:
      return buildDrivingLicenceXml(persona);
    default:
      return null;
  }
}
