class ScraperError extends Error {
  constructor(args) {
    super(args);
    this.name = "ScraperError";
  }
}

export default ScraperError;
