const QUERIES = {
  task: `
    query Task($scraperId: String!) {
      task(scraperId: $scraperId) {
        ... on Task {
          url
        }
        ... on Error {
          error
        }
      }
    }
  `,
};

export default QUERIES;
