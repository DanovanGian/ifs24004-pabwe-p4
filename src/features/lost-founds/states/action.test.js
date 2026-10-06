import { beforeEach, describe, expect, it, vi } from "vitest";
import lostFoundApi from "../api/lostFoundApi";
import {
  showErrorDialog,
  showSuccessDialog,
} from "../../../helpers/toolsHelper";
import * as actions from "./action";

const { ActionType } = actions;

vi.mock("../api/lostFoundApi", () => ({
  default: {
    getLostFounds: vi.fn(),
    getLostFound: vi.fn(),
    getStatsMonthly: vi.fn(),
    postLostFound: vi.fn(),
    putLostFound: vi.fn(),
    postCover: vi.fn(),
    deleteLostFound: vi.fn(),
  },
}));
vi.mock("../../../helpers/toolsHelper", () => ({
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
}));

describe("lost-founds action creators", () => {
  it.each([
    ["setLostFoundsActionCreator", ActionType.SET_LOST_FOUNDS, "lostFounds"],
    ["setLostFoundActionCreator", ActionType.SET_LOST_FOUND, "lostFound"],
    ["setIsLostFoundActionCreator", ActionType.SET_IS_LOST_FOUND, "isLostFound"],
    ["setIsLostFoundAddActionCreator", ActionType.SET_IS_LOST_FOUND_ADD, "isLostFoundAdd"],
    ["setIsLostFoundAddedActionCreator", ActionType.SET_IS_LOST_FOUND_ADDED, "isLostFoundAdded"],
    ["setIsLostFoundChangeActionCreator", ActionType.SET_IS_LOST_FOUND_CHANGE, "isLostFoundChange"],
    ["setIsLostFoundChangedActionCreator", ActionType.SET_IS_LOST_FOUND_CHANGED, "isLostFoundChanged"],
    ["setIsLostFoundChangeCoverActionCreator", ActionType.SET_IS_LOST_FOUND_CHANGE_COVER, "isLostFoundChangeCover"],
    ["setIsLostFoundChangedCoverActionCreator", ActionType.SET_IS_LOST_FOUND_CHANGED_COVER, "isLostFoundChangedCover"],
    ["setIsLostFoundDeleteActionCreator", ActionType.SET_IS_LOST_FOUND_DELETE, "isLostFoundDelete"],
    ["setIsLostFoundDeletedActionCreator", ActionType.SET_IS_LOST_FOUND_DELETED, "isLostFoundDeleted"],
    ["setLostFoundStatsActionCreator", ActionType.SET_LOST_FOUND_STATS, "lostFoundStats"],
  ])("%s membuat action yang benar", (name, type, key) => {
    expect(actions[name]("nilai")).toEqual({ type, payload: { [key]: "nilai" } });
  });
});

describe("lost-founds thunks: baca data", () => {
  const dispatch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("asyncSetLostFounds", () => {
    it("memuat daftar tanpa filter", async () => {
      lostFoundApi.getLostFounds.mockResolvedValue([{ id: 1 }]);

      await actions.asyncSetLostFounds()(dispatch);

      expect(lostFoundApi.getLostFounds).toHaveBeenCalledWith({});
      expect(dispatch).toHaveBeenCalledWith(actions.setLostFoundsActionCreator([{ id: 1 }]));
    });

    it("meneruskan filter ke API", async () => {
      lostFoundApi.getLostFounds.mockResolvedValue([]);

      await actions.asyncSetLostFounds({ status: "lost" })(dispatch);

      expect(lostFoundApi.getLostFounds).toHaveBeenCalledWith({ status: "lost" });
    });

    it("menampilkan error saat gagal", async () => {
      lostFoundApi.getLostFounds.mockRejectedValue(new Error("Gagal"));

      await actions.asyncSetLostFounds()(dispatch);

      expect(showErrorDialog).toHaveBeenCalledWith("Gagal");
      expect(dispatch).not.toHaveBeenCalled();
    });
  });

  describe("asyncSetLostFound", () => {
    it("memuat detail lalu menandai selesai", async () => {
      lostFoundApi.getLostFound.mockResolvedValue({ id: 5 });

      await actions.asyncSetLostFound(5)(dispatch);

      expect(dispatch).toHaveBeenNthCalledWith(1, actions.setIsLostFoundActionCreator(false));
      expect(dispatch).toHaveBeenNthCalledWith(2, actions.setLostFoundActionCreator({ id: 5 }));
      expect(dispatch).toHaveBeenNthCalledWith(3, actions.setIsLostFoundActionCreator(true));
    });

    it("mengosongkan detail dan tetap menandai selesai saat gagal", async () => {
      lostFoundApi.getLostFound.mockRejectedValue(new Error("Tidak ada"));

      await actions.asyncSetLostFound(5)(dispatch);

      expect(showErrorDialog).toHaveBeenCalledWith("Tidak ada");
      expect(dispatch).toHaveBeenNthCalledWith(2, actions.setLostFoundActionCreator(null));
      expect(dispatch).toHaveBeenNthCalledWith(3, actions.setIsLostFoundActionCreator(true));
    });
  });

  describe("asyncSetLostFoundStats", () => {
    it("menyimpan statistik", async () => {
      lostFoundApi.getStatsMonthly.mockResolvedValue({ a: 1 });

      await actions.asyncSetLostFoundStats()(dispatch);

      expect(dispatch).toHaveBeenCalledWith(actions.setLostFoundStatsActionCreator({ a: 1 }));
    });

    it("menampilkan error saat gagal", async () => {
      lostFoundApi.getStatsMonthly.mockRejectedValue(new Error("Gagal"));

      await actions.asyncSetLostFoundStats()(dispatch);

      expect(showErrorDialog).toHaveBeenCalledWith("Gagal");
    });
  });
});

describe.each([
  ["asyncAddLostFound", () => actions.asyncAddLostFound("t", "d", "lost"), "postLostFound", "setIsLostFoundAddActionCreator", "setIsLostFoundAddedActionCreator"],
  ["asyncChangeLostFound", () => actions.asyncChangeLostFound(5, "t", "d", "lost", 1), "putLostFound", "setIsLostFoundChangeActionCreator", "setIsLostFoundChangedActionCreator"],
  ["asyncChangeLostFoundCover", () => actions.asyncChangeLostFoundCover(5, "file"), "postCover", "setIsLostFoundChangeCoverActionCreator", "setIsLostFoundChangedCoverActionCreator"],
  ["asyncDeleteLostFound", () => actions.asyncDeleteLostFound(5), "deleteLostFound", "setIsLostFoundDeleteActionCreator", "setIsLostFoundDeletedActionCreator"],
])("%s", (_name, makeThunk, apiMethod, processName, doneName) => {
  const dispatch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("menandai proses, menampilkan sukses, lalu menandai selesai", async () => {
    lostFoundApi[apiMethod].mockResolvedValue("Berhasil");

    await makeThunk()(dispatch);

    expect(showSuccessDialog).toHaveBeenCalledWith("Berhasil");
    expect(dispatch).toHaveBeenNthCalledWith(1, actions[processName](true));
    expect(dispatch).toHaveBeenNthCalledWith(2, actions[doneName](true));
    expect(dispatch).toHaveBeenNthCalledWith(3, actions[processName](false));
  });

  it("menampilkan error dan tidak menandai berhasil saat gagal", async () => {
    lostFoundApi[apiMethod].mockRejectedValue(new Error("Gagal"));

    await makeThunk()(dispatch);

    expect(showErrorDialog).toHaveBeenCalledWith("Gagal");
    expect(dispatch).toHaveBeenNthCalledWith(1, actions[processName](true));
    expect(dispatch).toHaveBeenNthCalledWith(2, actions[processName](false));
    expect(dispatch).toHaveBeenCalledTimes(2);
  });
});
