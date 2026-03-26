const BASE_URL = "https://data.usajobs.gov/api/search";
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildUrl(params) {
  const url = new URL(BASE_URL);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return url.toString();
}

async function fetchWithRetry(url, attempt = 1) {
  const headers = {
    Host: "data.usajobs.gov",
    "User-Agent": process.env.USAJOBS_EMAIL,
    "Authorization-Key": process.env.USAJOBS_API_KEY,
  };

  try {
    const res = await fetch(url, { headers });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    return await res.json();
  } catch (err) {
    if (attempt >= MAX_RETRIES) {
      throw new Error(`USAJOBS request failed after ${MAX_RETRIES} attempts: ${err.message}`);
    }

    const delay = RETRY_DELAY_MS * attempt;
    console.warn(`Attempt ${attempt} failed (${err.message}). Retrying in ${delay}ms...`);
    await sleep(delay);
    return fetchWithRetry(url, attempt + 1);
  }
}

/**
 * Fetches all pages for a given query params object.
 * Handles page-based pagination automatically.
 * Returns a flat array of job items.
 */
export async function fetchJobs(params) {
  const jobs = [];
  let page = 1;
  let totalPages = 1;

  do {
    const url = buildUrl({ ...params, Page: page });
    console.log(`Fetching page ${page}/${totalPages}: ${url}`);

    const data = await fetchWithRetry(url);
    const result = data?.SearchResult;

    if (!result || !result.SearchResultItems?.length) {
      break;
    }

    jobs.push(...result.SearchResultItems.map((item) => item.MatchedObjectDescriptor));

    totalPages = parseInt(result.UserArea?.NumberOfPages ?? "1", 10);
    page++;
  } while (page <= totalPages);

  return jobs;
}
