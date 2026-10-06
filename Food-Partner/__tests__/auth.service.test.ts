import { loginPartner, requestPasswordResetOtp, resetPassword } from "@/services/auth.service";
import { ApiError, customFetch } from "@/utils/api/custom-fetch";

jest.mock("@/utils/api/custom-fetch", () => {
  const actual = jest.requireActual("@/utils/api/custom-fetch");
  return { ...actual, customFetch: jest.fn() };
});

const fetchMock = customFetch as jest.MockedFunction<typeof customFetch>;

const apiError = (status: number, message: string) =>
  new ApiError({ status, statusText: "", headers: {}, url: "" } as unknown as Response, { message }, { method: "POST", url: "/x" });

const bodyOf = (call: number) => JSON.parse(String(fetchMock.mock.calls[call][1]?.body));

beforeEach(() => fetchMock.mockReset());

describe("loginPartner", () => {
  it("signs a restaurant in with the restaurant login", async () => {
    fetchMock.mockResolvedValueOnce({ token: "t", _id: "v1", name: "Spice Hub", role: "restaurant_vendor" });
    await expect(loginPartner("owner@spice.in", "secret")).resolves.toMatchObject({ _id: "v1" });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe("/vendors/login");
  });

  it("falls back to the meat-centre login when the restaurant login fails", async () => {
    fetchMock.mockRejectedValueOnce(apiError(401, "Invalid credentials"));
    fetchMock.mockResolvedValueOnce({ token: "t", _id: "m1", name: "Fresh Cuts", role: "meat_vendor" });
    await expect(loginPartner("9848012345", "secret")).resolves.toMatchObject({ _id: "m1" });
    expect(fetchMock.mock.calls[1][0]).toBe("/meat/login");
  });

  it("reports a pending application as-is instead of masking it with a meat-centre failure", async () => {
    fetchMock.mockRejectedValueOnce(apiError(403, "Your application is under review"));
    await expect(loginPartner("owner@spice.in", "secret")).rejects.toMatchObject({ status: 403 });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("sends an email lower-cased and a phone number as typed", async () => {
    fetchMock.mockResolvedValue({ token: "t" });
    await loginPartner("  Owner@Spice.IN ", "pw");
    await loginPartner(" 9848012345 ", "pw");
    expect(bodyOf(0)).toEqual({ email: "owner@spice.in", password: "pw" });
    expect(bodyOf(1)).toEqual({ phone: "9848012345", password: "pw" });
  });
});

describe("password reset", () => {
  it("asks both account types for a code and succeeds if either accepts", async () => {
    fetchMock.mockRejectedValueOnce(apiError(500, "down")).mockResolvedValueOnce({});
    await expect(requestPasswordResetOtp("a@b.in")).resolves.toBeUndefined();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("fails only when both refuse", async () => {
    fetchMock.mockRejectedValue(apiError(429, "Too many requests"));
    await expect(requestPasswordResetOtp("a@b.in")).rejects.toMatchObject({ status: 429 });
  });

  it("tries the restaurant reset when the code wasn't a meat-centre one", async () => {
    fetchMock.mockRejectedValueOnce(apiError(400, "Invalid code")).mockResolvedValueOnce({});
    await resetPassword("a@b.in", " 123456 ", "newpass");
    expect(fetchMock.mock.calls.map((c) => c[0])).toEqual(["/meat/reset-password", "/vendors/reset-password"]);
    expect(bodyOf(1)).toEqual({ email: "a@b.in", otp: "123456", newPassword: "newpass" });
  });
});
