require('dotenv').config();
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { Client } = require('pg');

async function run() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  // 1. Find last ingested timestamp
  const res = await client.query(`SELECT MAX(created_at) AS last_ts FROM requests;`);
  const lastTs = res.rows[0].last_ts || new Date(0).toISOString();
  console.log(`Last ingested timestamp: ${lastTs}`);

  // 2. Stream CSV and only process newer rows
  let rowCount = 0;
  const parser = fs.createReadStream(path.resolve(process.env.CSV_PATH))
    .pipe(csv({ mapHeaders: ({ header }) => header.trim() }));

  for await (const row of parser) {
    const created = row['Creation Date'];
    if (created <= lastTs) continue;

    const id = `${created}_${row['First 3 Chars of Postal Code']}_${row['Service Request Type']}`
      .slice(0, 200);
    const params = [
      id,
      created,
      row['Status'],
      row['First 3 Chars of Postal Code'],
      row['Intersection Street 1'],
      row['Intersection Street 2'],
      row['Ward'],
      row['Service Request Type'],
      row['Division'],
      row['Section']
    ];

    const sql = `
      INSERT INTO requests(
        id, created_at, status, postal_area, street_1, street_2,
        ward, request_type, division, section
      )
      VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      ON CONFLICT (id) DO UPDATE SET
        status       = EXCLUDED.status,
        street_1     = EXCLUDED.street_1,
        street_2     = EXCLUDED.street_2,
        ward         = EXCLUDED.ward,
        request_type = EXCLUDED.request_type,
        division     = EXCLUDED.division,
        section      = EXCLUDED.section;
    `;

    try {
      await client.query(sql, params);
      rowCount++;
    } catch (err) {
      console.error('Upsert error:', err.message);
    }
  }

  console.log(`Incremental ingest complete: ${rowCount} new rows added.`);
  await client.end();
}

run().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
