import {
  validateAadhaar, validateAccountMatch, validateBankAccount, validateConfirmPassword, validateEmail,
  validateHomeAddress, validateIfsc, validateLicenseExpiry, validateLicenseNumber, validateNewPassword,
  validateOtp, validatePan, validatePersonName, validatePhone, verhoeffCheckDigit, verhoeffValid,
} from "../validation";

const aadhaarWithCheck = (base11: string) => base11 + verhoeffCheckDigit(base11);

describe("name", () => {
  it("accepts real names, in any script", () => {
    for (const n of ["Ravi Kumar", "A. P. J. Abdul", "D'Souza", "Anne-Marie", "రవి కుమార్", "रवि कुमार"]) {
      expect(validatePersonName(n)).toBeNull();
    }
  });
  it("rejects empty, one letter, digits and symbols", () => {
    expect(validatePersonName("  ")).toBe("nameRequired");
    expect(validatePersonName("R")).toBe("nameLength");
    expect(validatePersonName("Ravi123")).toBe("nameChars");
    expect(validatePersonName("<script>")).toBe("nameChars");
    expect(validatePersonName("a".repeat(61))).toBe("nameLength");
  });
});

describe("phone", () => {
  it("needs ten digits starting 6-9", () => {
    expect(validatePhone("9876543210")).toBeNull();
    expect(validatePhone("")).toBe("phoneRequired");
    expect(validatePhone("987654321")).toBe("phoneInvalid");
    expect(validatePhone("5876543210")).toBe("phoneInvalid");
    expect(validatePhone("98765432101")).toBe("phoneInvalid");
  });
});

describe("email", () => {
  it("accepts normal addresses", () => {
    expect(validateEmail("ravi.kumar+1@mail.example.co.in")).toBeNull();
  });
  it("rejects bad ones", () => {
    for (const e of ["", "ravi", "ravi@", "ravi@mail", "ra vi@mail.com", "ravi@@mail.com", "ravi@mail..com", "ravi@-mail.com"]) {
      expect(validateEmail(e)).not.toBeNull();
    }
    expect(validateEmail("a".repeat(65) + "@mail.com")).toBe("emailInvalid");
  });
});

describe("password", () => {
  it("needs 8+ characters with a letter and a number", () => {
    expect(validateNewPassword("abcd1234")).toBeNull();
    expect(validateNewPassword("")).toBe("passwordRequired");
    expect(validateNewPassword("abc123")).toBe("passwordShort");
    expect(validateNewPassword("abcdefgh")).toBe("passwordMix");
    expect(validateNewPassword("12345678")).toBe("passwordMix");
    expect(validateNewPassword("a1".repeat(33))).toBe("passwordLong");
  });
  it("must match its confirmation", () => {
    expect(validateConfirmPassword("abcd1234", "abcd1234")).toBeNull();
    expect(validateConfirmPassword("abcd1234", "")).toBe("confirmRequired");
    expect(validateConfirmPassword("abcd1234", "abcd1235")).toBe("confirmMismatch");
  });
});

describe("otp", () => {
  it("is exactly six digits", () => {
    expect(validateOtp("123456")).toBeNull();
    expect(validateOtp("12345")).toBe("otpInvalid");
    expect(validateOtp("12345a")).toBe("otpInvalid");
  });
});

describe("aadhaar", () => {
  it("knows the Verhoeff checksum", () => {
    expect(verhoeffValid("2363")).toBe(true);
    expect(verhoeffValid("2364")).toBe(false);
  });
  it("accepts a number with a correct check digit, with or without spaces", () => {
    const n = aadhaarWithCheck("23456789012");
    expect(validateAadhaar(n)).toBeNull();
    expect(validateAadhaar(`${n.slice(0, 4)} ${n.slice(4, 8)} ${n.slice(8)}`)).toBeNull();
  });
  it("rejects a typo, a swap, a leading 0 or 1, and wrong length", () => {
    const n = aadhaarWithCheck("23456789012");
    const wrongLast = n.slice(0, 11) + ((Number(n[11]) + 1) % 10);
    expect(validateAadhaar(wrongLast)).toBe("aadhaarInvalid");
    expect(validateAadhaar(n.slice(0, 3) + n[4] + n[3] + n.slice(5))).toBe("aadhaarInvalid");
    expect(validateAadhaar(aadhaarWithCheck("13456789012"))).toBe("aadhaarInvalid");
    expect(validateAadhaar("2345678901")).toBe("aadhaarInvalid");
    expect(validateAadhaar("")).toBe("aadhaarRequired");
  });
});

describe("pan", () => {
  it("needs the standard shape and a real holder-type letter", () => {
    expect(validatePan("ABCPE1234F")).toBeNull();
    expect(validatePan("abcpe1234f")).toBeNull();
    expect(validatePan("ABCDE1234F")).toBe("panInvalid"); // 4th letter D isn't a holder type
    expect(validatePan("ABCPE12345")).toBe("panInvalid");
    expect(validatePan("ABCPE1234")).toBe("panInvalid");
    expect(validatePan("")).toBe("panRequired");
  });
});

describe("driving license", () => {
  const now = new Date(2026, 9, 17);
  it("accepts the standard layout with a plausible year", () => {
    expect(validateLicenseNumber("HR-06-2020-1234567", now)).toBeNull();
    expect(validateLicenseNumber("HR0620201234567", now)).toBeNull();
  });
  it("rejects bad layouts and impossible years", () => {
    expect(validateLicenseNumber("", now)).toBe("dlRequired");
    expect(validateLicenseNumber("HR06202012345", now)).toBe("dlInvalid");
    expect(validateLicenseNumber("HR-06-1920-1234567", now)).toBe("dlInvalid");
    expect(validateLicenseNumber("HR-06-2031-1234567", now)).toBe("dlInvalid");
  });
  it("expiry: today is fine, yesterday is not, 60 years ahead is not", () => {
    expect(validateLicenseExpiry(new Date(2026, 9, 17), now)).toBeNull();
    expect(validateLicenseExpiry(new Date(2026, 9, 16), now)).toBe("expiryPast");
    expect(validateLicenseExpiry(new Date(2086, 0, 1), now)).toBe("expiryTooFar");
    expect(validateLicenseExpiry(null, now)).toBe("expiryRequired");
  });
});

describe("home address", () => {
  it("needs enough text and a picked map position", () => {
    expect(validateHomeAddress("12-3, MG Road, Hyderabad", true)).toBeNull();
    expect(validateHomeAddress("", true)).toBe("addressRequired");
    expect(validateHomeAddress("MG Road", true)).toBe("addressShort");
    expect(validateHomeAddress("x".repeat(201), true)).toBe("addressLong");
    expect(validateHomeAddress("12-3, MG Road, Hyderabad", false)).toBe("addressNotPicked");
  });
});

describe("bank", () => {
  it("account: 9-18 digits, not one repeated digit", () => {
    expect(validateBankAccount("123456789012")).toBeNull();
    expect(validateBankAccount("")).toBe("accountRequired");
    expect(validateBankAccount("12345678")).toBe("accountLength");
    expect(validateBankAccount("1".repeat(19))).toBe("accountLength");
    expect(validateBankAccount("111111111111")).toBe("accountInvalid");
    expect(validateBankAccount("12345678a")).toBe("accountInvalid");
  });
  it("confirmation must match", () => {
    expect(validateAccountMatch("123456789", "123456789")).toBeNull();
    expect(validateAccountMatch("123456789", "123456788")).toBe("accountMismatch");
  });
  it("ifsc: four letters, a zero, six more", () => {
    expect(validateIfsc("SBIN0001234")).toBeNull();
    expect(validateIfsc("sbin0001234")).toBeNull();
    expect(validateIfsc("")).toBe("ifscRequired");
    expect(validateIfsc("SBIN1001234")).toBe("ifscInvalid");
    expect(validateIfsc("SBI00001234")).toBe("ifscInvalid");
    expect(validateIfsc("SBIN000123")).toBe("ifscInvalid");
  });
});
