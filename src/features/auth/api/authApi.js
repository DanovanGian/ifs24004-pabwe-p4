import apiHelper from "../../../helpers/apiHelper";

const authApi = (() => {
  const BASE_URL = `${DELCOM_BASEURL}/auth`;

  function _url(path) {
    return BASE_URL + path;
  }

  async function postRegister(name, email, password) {
    const response = await apiHelper.fetchData(_url("/register"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        password,
      }),
    });

    const result = await response.json();
    if (result.status !== "success") {
      const errorDetails =
        result.data && typeof result.data === "object"
          ? Object.values(result.data).flat().join(", ")
          : "";
      const baseMsg = result.message || "Gagal melakukan pendaftaran";
      throw new Error(errorDetails ? `${baseMsg}: ${errorDetails}` : baseMsg);
    }

    return result.message;
  }

  async function postLogin(email, password) {
    const response = await apiHelper.fetchData(_url("/login"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const result = await response.json();
    if (result.status !== "success") {
      throw new Error(result.message || "Gagal login");
    }

    return result.data;
  }

  return {
    postRegister,
    postLogin,
  };
})();

export default authApi;