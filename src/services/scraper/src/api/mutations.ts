const MUTATIONS = {
  setTaskSource: `mutation SetTaskSource($scraperId: String!, $url: String!, $source: String!) {
    setTaskSource(scraperId: $scraperId, url: $url, source: $source)
  }`,
};

export default MUTATIONS;
