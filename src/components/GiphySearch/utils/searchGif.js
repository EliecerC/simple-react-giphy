function fetchApi({
  url,
  method = 'GET',
  headers = {},
  queryParams = {},
  body
}) {
  url = new URL(url);

  Object.keys(queryParams)
    .forEach(key =>
      url.searchParams.append(key, queryParams[key])
    );

  body = body ? JSON.stringify(body) : body;

  return fetch(url, { method, headers, body })
    .then(async response => {
      if (response.status === 200) { return response.json(); }
      throw new Error(`Bad status code ${response.status}`);
    })
    .then(responseObj => responseObj)
    .catch(error => {
      console.error('Error:', error);
    });
}

/**
 * returns search results of query from giphy api.
 * Go to: https://developers.giphy.com/docs/api/endpoint#search
 *
 * @param {string} query
 * @param {Object} options
 * @returns {Object}
 */
function searchGif(query, options) {
  return fetchApi({
    url: 'https://api.giphy.com/v1/gifs/search',
    queryParams: {
      // eslint-disable-next-line no-undef
      api_key: process.env.GIPHY_API_KEY,
      q: query,
      ...options
    }
  }).catch(error => {
    console.log(error);
    console.log(error.stack);
    throw error;
  });
}

export default searchGif;