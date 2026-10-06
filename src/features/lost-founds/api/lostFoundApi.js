import apiHelper from "../../../helpers/apiHelper";

const lostFoundApi = (() => {
  const BASE_URL = `${DELCOM_BASEURL}/lost-founds`;

  async function _request(path, options = {}) {
    const response = await apiHelper.fetchData(BASE_URL + path, options);
    const result = await response.json();
    if (result.status !== "success") {
      throw new Error(result.message);
    }
    return result;
  }

  function _json(method, body) {
    return {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    };
  }

  // filters: { status, is_completed, is_me }
  async function getLostFounds(filters = {}) {
    const result = await _request(apiHelper.buildQuery(filters));
    return result.data.lost_founds;
  }

  async function getLostFound(id) {
    const result = await _request(`/${id}`);
    return result.data.lost_found;
  }

  async function postLostFound(title, description, status) {
    const result = await _request("", _json("POST", { title, description, status }));
    return result.message;
  }

  async function putLostFound(id, title, description, status, isCompleted) {
    const result = await _request(
      `/${id}`,
      _json("PUT", { title, description, status, is_completed: isCompleted })
    );
    return result.message;
  }

  async function postCover(id, cover) {
    const formData = new FormData();
    formData.append("cover", cover);
    const result = await _request(`/${id}/cover`, {
      method: "POST",
      body: formData,
    });
    return result.message;
  }

  async function deleteLostFound(id) {
    const result = await _request(`/${id}`, { method: "DELETE" });
    return result.message;
  }

  async function getStatsDaily(params = {}) {
    const result = await _request(`/stats/daily${apiHelper.buildQuery(params)}`);
    return result.data;
  }

  async function getStatsMonthly(params = {}) {
    const result = await _request(`/stats/monthly${apiHelper.buildQuery(params)}`);
    return result.data;
  }

  return {
    getLostFounds,
    getLostFound,
    postLostFound,
    putLostFound,
    postCover,
    deleteLostFound,
    getStatsDaily,
    getStatsMonthly,
  };
})();

export default lostFoundApi;