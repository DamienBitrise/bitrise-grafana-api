module.exports = {
  BASE_URL: 'https://api.bitrise.io/v0.1/apps',
  getHeaders: (api_key) => {
    return {
          headers: { 
            'accept': 'application/json',
            'Authorization': api_key
          },
      }
  }
}