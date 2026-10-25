import { isValidEmail, isValidIdentifier, toMobileNumber } from "../login.validation";

describe("toMobileNumber", () => {
  it("accepts a plain 10-digit number, with spaces, dashes and prefixes", () => {
    expect(toMobileNumber("9849021734")).toBe("9849021734");
    expect(toMobileNumber("98490 21734")).toBe("9849021734");
    expect(toMobileNumber("98490-21734")).toBe("9849021734");
    expect(toMobileNumber("+91 98490 21734")).toBe("9849021734");
    expect(toMobileNumber("09849021734")).toBe("9849021734");
  });

  it("rejects wrong lengths, letters and emails", () => {
    expect(toMobileNumber("")).toBeNull();
    expect(toMobileNumber("98490")).toBeNull();
    expect(toMobileNumber("984902173412")).toBeNull();
    expect(toMobileNumber("user1234567890@mail.com")).toBeNull();
    expect(toMobileNumber("98490abc1734")).toBeNull();
  });
});

describe("isValidEmail", () => {
  it("checks the shape of an email", () => {
    expect(isValidEmail("a@b.co")).toBe(true);
    expect(isValidEmail("abc")).toBe(false);
    expect(isValidEmail("a@b")).toBe(false);
    expect(isValidEmail("a b@c.com")).toBe(false);
  });
});

describe("isValidIdentifier", () => {
  it("takes a phone or an email and nothing else", () => {
    expect(isValidIdentifier("9849021734")).toBe(true);
    expect(isValidIdentifier("me@mail.com")).toBe(true);
    expect(isValidIdentifier("me@mail")).toBe(false);
    expect(isValidIdentifier("12345")).toBe(false);
    expect(isValidIdentifier("hello")).toBe(false);
  });
});
