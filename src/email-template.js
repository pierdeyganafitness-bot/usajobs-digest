function formatSalary(remuneration) {
  if (!remuneration?.length) return "Not listed";
  const { MinimumRange, MaximumRange, RateIntervalCode } = remuneration[0];
  const fmt = (n) =>
    Number(n).toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
  return `${fmt(MinimumRange)} - ${fmt(MaximumRange)} / ${RateIntervalCode}`;
}

function formatDate(dateStr) {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function jobCard(job) {
  const location = job.PositionLocation?.map((l) => l.LocationName).join(", ") ?? "Not specified";
  const grade = job.JobGrade?.map((g) => g.Code).join(", ") ?? "";
  const schedule = job.PositionSchedule?.map((s) => s.Name).join(", ") ?? "";
  const isRemote = location.toLowerCase().includes("anywhere") || location.toLowerCase().includes("remote");

  return `
    <tr>
      <td style="padding:16px;border-bottom:1px solid #e5e7eb;vertical-align:top;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td>
              <a href="${job.PositionURI}" style="font-size:16px;font-weight:600;color:#1d4ed8;text-decoration:none;">
                ${job.PositionTitle}
              </a>
              ${isRemote ? '<span style="margin-left:8px;background:#dcfce7;color:#166534;font-size:11px;padding:2px 8px;border-radius:9999px;font-weight:600;">REMOTE</span>' : ""}
            </td>
          </tr>
          <tr>
            <td style="padding-top:4px;font-size:13px;color:#6b7280;">
              ${job.OrganizationName} &bull; ${job.DepartmentName}
            </td>
          </tr>
          <tr>
            <td style="padding-top:8px;font-size:13px;color:#374151;">
              <strong>Location:</strong> ${location}
            </td>
          </tr>
          <tr>
            <td style="padding-top:4px;font-size:13px;color:#374151;">
              <strong>Salary:</strong> ${formatSalary(job.PositionRemuneration)}
              ${grade ? `&nbsp;&bull;&nbsp;<strong>Grade:</strong> ${grade}` : ""}
              ${schedule ? `&nbsp;&bull;&nbsp;<strong>Schedule:</strong> ${schedule}` : ""}
            </td>
          </tr>
          <tr>
            <td style="padding-top:4px;font-size:13px;color:#dc2626;">
              <strong>Apply by:</strong> ${formatDate(job.ApplicationCloseDate)}
            </td>
          </tr>
          <tr>
            <td style="padding-top:10px;">
              <a href="${job.PositionURI}"
                style="display:inline-block;background:#1d4ed8;color:#ffffff;font-size:13px;font-weight:600;padding:6px 16px;border-radius:6px;text-decoration:none;">
                View &amp; Apply
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `;
}

export function buildEmailHtml(jobs) {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });

  const remoteJobs = jobs.filter((j) => {
    const loc = j.PositionLocation?.map((l) => l.LocationName).join(", ") ?? "";
    return loc.toLowerCase().includes("anywhere") || loc.toLowerCase().includes("remote");
  });

  const prJobs = jobs.filter((j) => {
    const loc = j.PositionLocation?.map((l) => l.LocationName).join(", ") ?? "";
    return loc.toLowerCase().includes("puerto rico") || loc.toLowerCase().includes("san juan");
  });

  const otherJobs = jobs.filter(
    (j) => !remoteJobs.includes(j) && !prJobs.includes(j)
  );

  function section(title, list) {
    if (!list.length) return "";
    return `
      <tr>
        <td style="padding:24px 24px 4px;font-size:14px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:0.05em;border-top:3px solid #1d4ed8;">
          ${title} (${list.length})
        </td>
      </tr>
      ${list.map(jobCard).join("")}
    `;
  }

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td style="background:#1d4ed8;padding:24px;text-align:center;">
              <p style="margin:0;font-size:22px;font-weight:700;color:#ffffff;">Federal Jobs Digest</p>
              <p style="margin:4px 0 0;font-size:13px;color:#bfdbfe;">${today}</p>
            </td>
          </tr>

          <!-- Summary bar -->
          <tr>
            <td style="background:#eff6ff;padding:12px 24px;font-size:13px;color:#1e40af;border-bottom:1px solid #dbeafe;">
              ${jobs.length} new listing${jobs.length !== 1 ? "s" : ""} this week &bull;
              ${remoteJobs.length} remote &bull;
              ${prJobs.length} in Puerto Rico
            </td>
          </tr>

          <!-- Job sections -->
          <table width="100%" cellpadding="0" cellspacing="0">
            ${section("Remote Positions", remoteJobs)}
            ${section("Puerto Rico Positions", prJobs)}
            ${otherJobs.length ? section("Other Matching Positions", otherJobs) : ""}
          </table>

          <!-- Footer -->
          <tr>
            <td style="padding:24px;text-align:center;font-size:12px;color:#9ca3af;border-top:1px solid #e5e7eb;">
              Listings sourced from <a href="https://www.usajobs.gov" style="color:#6b7280;">USAJOBS.gov</a>.
              GS-01 to GS-07 entry-level filter applied. Apply before closing dates.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}
