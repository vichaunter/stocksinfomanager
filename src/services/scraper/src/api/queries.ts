const QUERIES = {
  task: `
    query Task {
      task {
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
