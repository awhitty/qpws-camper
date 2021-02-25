#!/usr/bin/env node
const { chromium } = require("playwright-chromium");
const { zip } = require("lodash");
const { DateTime } = require("luxon");

let verbose = false;

function logVerbose(msg) {
  if (verbose) {
    console.info(msg);
  }
}

async function searchForFacility(page, facilityName) {
  await page.fill("#txtParkSearch", facilityName);
  if (await page.$(`text=${facilityName}`)) {
    logVerbose("Found facility by name");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
    await page.click("#mainContent_homeContent_btnSearch");
    await page.waitForSelector(
      "#mainContent_homeContent_combineViewTab_listingViewTab"
    );
  } else {
    throw new Error(`Could not find facility with name "${facilityName}"`);
  }
}

async function readFancyboxAvailabilities(frame, date) {
  logVerbose("Setting availability start date");
  await frame.evaluate((date) => {
    $("#txtArrivalDate").datepicker("setDate", date);
  }, date);
  await frame.click("#LinkButton1");

  logVerbose("Waiting for table reload");
  await frame.waitForSelector("table.grid_sys", { state: "detached" });
  await frame.waitForSelector("table.grid_sys", { state: "attached" });

  logVerbose("Reading data from table");
  const dateRowHandles = await frame.$$(
    "table.grid_sys thead tr:last-child th"
  );
  const rawDates = await Promise.all(
    dateRowHandles.map((handle) => handle.getAttribute("title"))
  );

  const dates = rawDates.map((date) =>
    DateTime.fromFormat(date, "DDD").toFormat("ccc, D")
  );

  const countRowHandles = await frame.$$(
    "table.grid_sys tbody tr:nth-child(2) td"
  );
  const [rowHeading, ...rawCounts] = await Promise.all(
    countRowHandles.map((handle) => handle.innerText())
  );
  const counts = rawCounts.map((str) =>
    str === "X" ? 0 : Number.parseInt(str)
  );

  if (rowHeading !== "Available # of People") {
    console.warn(
      "Availability table looks different than expected. Results might be incorrect."
    );
  }

  return zip(dates, counts).map(([date, sites_available]) => ({
    date,
    sites_available,
  }));
}

async function fetchAvailabilitiesForFacility(browser, facilityName, date) {
  // Open the "SearchView"
  const page = await browser.newPage();
  await page.goto("https://qpws.usedirect.com/QPWS/Facilities/SearchView.aspx");

  await searchForFacility(page, facilityName);

  logVerbose("Loading facility availabilities");
  /*
   * TODO: Support other kinds of grid flows.
   *
   * There seem to be three entrypoints but only two kinds of grids to parse. The "Check
   * Availability" button opens a fancybox. The "See Calendar" and "Continue" buttons both link to a
   * full page grid. A search for "Barrabool remote bush camp" repros the "Continue" button.
   */
  await page.click(
    `.grid-box-list:has-text("${facilityName}") .btn:has-text("Check Availability")`
  );

  // Wait for iframe holding availability table to load
  await page.waitForSelector('//iframe[contains(@src,"FacilityAvailibility")]');
  const frame = page.frames()[2];
  await frame.waitForSelector(".reservation-box");

  return readFancyboxAvailabilities(frame, date);
}

const main = async (argv) => {
  const parsedDate = DateTime.fromFormat(argv.date, "yyyy-MM-dd").toFormat(
    "dd/MM/yyyy"
  );

  logVerbose("Opening browser");
  const browser = await chromium.launch({ headless: !argv["debug-browser"] });

  try {
    const table = await fetchAvailabilitiesForFacility(
      browser,
      argv.facility,
      parsedDate
    );
    console.table(table);
  } catch (err) {
    console.error(err);
  } finally {
    logVerbose("Closing browser");
    await browser.close();
  }
};

if (require.main === module) {
  const yargs = require("yargs/yargs");
  const { hideBin } = require("yargs/helpers");

  const argv = yargs(hideBin(process.argv))
    .usage('$0 --date 2021-05-01 --facility "MV Sarawak"')
    .option("date", {
      alias: "d",
      type: "string",
      required: true,
      description: "Start date in YYYY-MM-DD format",
    })
    .option("facility", {
      alias: "f",
      type: "string",
      required: true,
      description: "Exact name of facility",
    })
    .option("debug-browser", {
      type: "boolean",
      description: 'Run browser in "headed" mode',
    })
    .option("verbose", {
      alias: "v",
      type: "boolean",
      description: "Verbose logging",
    })
    .help().argv;

  verbose = argv.verbose;

  main(argv);
}
