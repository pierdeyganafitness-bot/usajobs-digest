import { fetchJobs } from "./usajobs.js";
import { buildEmailHtml } from "./email-template.js";
import { sendDigest } from "./mailer.js";

const QUERIES = [
  // Puerto Rico listings, entry-level (GS-01 to GS-07), public, posted last 7 days
  {
    LocationName: "Puerto Rico",
    WhoMayApply: "public",
    PayGradeLow: "01",
    PayGradeHigh: "07",
    DatePosted: 7,
    ResultsPerPage: 500,
    SortField: "opendate",
    SortDirection: "Desc",
  },
  // Remote listings with same filters (separate pass — RemoteIndicator=True ignores location)
  {
    RemoteIndicator: "True",
    WhoMayApply: "public",
    PayGradeLow: "01",
    PayGradeHigh: "07",
    DatePosted: 7,
    ResultsPerPage: 500,
    SortField: "opendate",
    SortDirection: "Desc",
  },
];

async function main() {
  console.log("Fetching jobs...");

  const allResults = await Promise.all(QUERIES.map(fetchJobs));

  // Merge and deduplicate on MatchedObjectId
  const seen = new Set();
  const jobs = [];
  for (const batch of allResults) {
    for (const job of batch) {
      if (!seen.has(job.MatchedObjectId)) {
        seen.add(job.MatchedObjectId);
        jobs.push(job);
      }
    }
  }

  console.log(`Found ${jobs.length} unique jobs after deduplication.`);

  if (jobs.length === 0) {
    console.log("No jobs found this week. Skipping email.");
    return;
  }

  const html = buildEmailHtml(jobs);
  await sendDigest(html, jobs.length);
  console.log("Digest sent.");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
