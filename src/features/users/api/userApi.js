import apiHelper from "../../../helpers/apiHelper";

const userApi = (() => {
  const BASE_URL = `${DELCOM_BASEURL}/users`;

  async function _request(path, options = {}) {
    const response = await apiHelper.fetchData(BASE_URL + path, options);
    const result = await response.json();
    if (result.status !== "success") {
      throw new Error(result.message);
    }
    return result;
  }

  async function getUsers() {
    const result = await _request("");
    return result.data.users;
  }

  async function getMe() {
    const result = await _request("/me");
    return result.data.user;
  }

  async function putMe(name, email) {
    const result = await _request("/me", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email }),
    });
    return result.message;
  }

  async function postPhoto(photo) {
    const formData = new FormData();
    formData.append("photo", photo); // ⚠️ nama field
    const result = await _request("/me/photo", {
      method: "POST",
      body: formData,
    });
    return result.message;
  }

  async function putPassword(password, newPassword) {
    const result = await _request("/me/password", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, new_password: newPassword }), // ⚠️ nama field
    });
    return result.message;
  }

  return { getUsers, getMe, putMe, postPhoto, putPassword };
})();

export default userApi;