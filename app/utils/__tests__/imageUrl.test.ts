import { PixelRatio } from "react-native";
import { optimizedImageUrl } from "../imageUrl";

describe("optimizedImageUrl", () => {
  beforeEach(() => {
    jest.spyOn(PixelRatio, "get").mockReturnValue(2);
  });
  afterEach(() => jest.restoreAllMocks());

  it("adds a resize + format transformation to a Cloudinary upload URL", () => {
    expect(optimizedImageUrl("https://res.cloudinary.com/demo/image/upload/v1712345/food/biryani.jpg", 100)).toBe(
      "https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,w_200,c_limit/v1712345/food/biryani.jpg",
    );
  });

  it("caps the width", () => {
    expect(optimizedImageUrl("https://res.cloudinary.com/demo/image/upload/a.jpg", 2000)).toContain("w_1080");
  });

  it("leaves a URL that already has a transformation alone", () => {
    const url = "https://res.cloudinary.com/demo/image/upload/w_300,c_fill/v1/a.jpg";
    expect(optimizedImageUrl(url, 100)).toBe(url);
  });

  it("leaves other hosts, empty values and non-upload URLs alone", () => {
    expect(optimizedImageUrl("https://example.com/a.jpg", 100)).toBe("https://example.com/a.jpg");
    expect(optimizedImageUrl("https://res.cloudinary.com/demo/video/upload/a.mp4", 100)).toBe("https://res.cloudinary.com/demo/video/upload/a.mp4");
    expect(optimizedImageUrl(undefined, 100)).toBeUndefined();
    expect(optimizedImageUrl("", 100)).toBe("");
  });
});
