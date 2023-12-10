const MUTATIONS = {
  setTaskSource: `mutation SetTaskSource($url: String!, $source: String!) {
    setTaskSource(url: $url, source: $source)
  }`,
};

export default MUTATIONS;
