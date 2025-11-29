import fingerprintReducer, { setFingerprintHash } from "../fingerprintSlice";

describe("fingerprintSlice", () => {
  const initialState = {
    fingerprintHash: "",
  };

  it("should return the initial state", () => {
    expect(fingerprintReducer(undefined, { type: "unknown" })).toEqual(
      initialState
    );
  });

  it("should handle setFingerprintHash", () => {
    const actual = fingerprintReducer(
      initialState,
      setFingerprintHash("test-hash")
    );
    expect(actual.fingerprintHash).toEqual("test-hash");
  });
});
