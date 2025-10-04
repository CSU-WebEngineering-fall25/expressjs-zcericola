const fetch = require('node-fetch');
const { error } = require( 'winston' );

class XKCDService {
  constructor() {
    this.baseUrl = 'https://xkcd.com';
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  async getLatest() {
    const cacheKey = 'latest';
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    try {
      const response = await fetch(`${this.baseUrl}/info.0.json`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const comic = await response.json();
      const processedComic = this.processComic(comic);
      
      this.cache.set(cacheKey, {
        data: processedComic,
        timestamp: Date.now()
      });
      
      return processedComic;
    } catch (error) {
      throw new Error(`Failed to fetch latest comic: ${error.message}`);
    }
  }

  // TODO: Implement getById method
  async getById(id) {
    // Validate that id is a positive integer
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error("Invalid comic ID");
    }
    const cacheKey = `comic-${id}`;
    const cachedValue = this.cache.get(cacheKey);
    // Check cache first using key `comic-${id}`
    if (cachedValue && Date.now() - cachedValue.timestamp < this.cacheTimeout) {
      return cachedValue.data;
    }

    try {
      // Fetch from https://xkcd.com/${id}/info.0.json
      const response = await fetch(`https://xkcd.com/${id}/info.0.json`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Process and cache the result
      const comic = await response.json();
      const processedComic = this.processComic(comic);

      this.cache.set(cacheKey, {
        data: processedComic,
        timestamp: Date.now()
      });

      // Return processed comic
      return processedComic;
    } catch(error) {
      if (error.message.includes('404')){
        throw new Error(`Comic not found`);
      } else {
        throw new Error(`Failed to get comic by Id: ${error.message}`);
      }
    }
  }

  // TODO: Implement getRandom method
  async getRandom() {
    // Get the latest comic to know the maximum ID
    const latestComic = await this.getLatest();
    // Generate random number between 1 and latest.id
    const randomComicId = this.getRandomIntBetweenTwoValsInclusive(1, latestComic.id);

    try {
      // Use getById to fetch the random comic
      const randomComic = await this.getById(randomComicId);
      return randomComic;
    } catch (err) {
      // Handle any errors appropriately
      throw new Error(`Error fetching random comic by ID: ${err.message}`);
    }
  }

  // TODO: Implement search method
  async search(query, page = 1, limit = 10) {
    if (query.length < 1 || query.length > 100) {
      throw new Error('Query length must be between 1 and 100 characters (inclusive)');
    }

    // This is a simplified search implementation
    // Get latest comic to know the range
    const latestComic = await this.getLatest();
    const latestComicId = latestComic.id;
    // Calculate offset from page and limit
    const offset = (page - 1) * limit;
    const NUM_COMICS_TO_SEARCH = 100;
    const requestsToMake = [];

    for (let i = latestComicId; i > (latestComicId - NUM_COMICS_TO_SEARCH || 0); i--) {
      // add responses to the list to fetch in parallel with promise.all
      requestsToMake.push(fetch(`https://xkcd.com/${i}/info.0.json`).then(response => {
        return response.json();
      }));
    }

    let rawResults;
    try {
      rawResults = await Promise.all(requestsToMake);
    } catch (err) {
      throw new Error(`Error searching last ${NUM_COMICS_TO_SEARCH} comics for specified query: ${query.length > 10 ? query.slice(0, 10): query}...`);
    }

    // Search through recent comics (e.g., last 100) for title/transcript matches
    const matchingResults = rawResults
    .map(comic => this.processComic(comic))
    .filter(comic => {
      // basic filtering and matching of the search term
      const qStr = query.toLowerCase();
      const titleStr = comic.title.toLowerCase();
      if (qStr.includes(titleStr) || titleStr.includes(qStr)){
        return true;
      } else {
        return false;
      }
    });


    // Return object with: query, results array, total, pagination object
    return {
      query,
      results: matchingResults,
      total: matchingResults.length,
      pagination: {
        limit,
        offset,
        page
      }
    }
  }

  processComic(comic) {
    return {
      id: comic.num,
      title: comic.title,
      img: comic.img,
      alt: comic.alt,
      transcript: comic.transcript || '',
      year: comic.year,
      month: comic.month,
      day: comic.day,
      safe_title: comic.safe_title
    };
  }

  getRandomIntBetweenTwoValsInclusive(min, max) {
    // sourced from https://www.w3schools.com/JS/js_random.asp
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}

module.exports = new XKCDService();