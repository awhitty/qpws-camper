qpws-camper is a tool to quickly check availabilities at campgrounds listed on the [Queensland National Parks Booking Service](https://qpws.usedirect.com/). Hopefully it saves you a few minutes and gets you out camping!

 So far the functionality is incomplete and lacks support for a few types of listings in the booking service. If you see a "Check Availabilities" button for the facility you're looking at, hopefully it should work. If not, feel free to open an issue.

## Installation

`npm install -g qpws-camper`

## Usage

`qpws-camper --date YYYY-MM-DD --facility "<facility name>"`

The CLI is limited and only takes a couple arguments. `--date` specifies the start date for the search. `--facility` specifies the facility name _exactly_ as you see it on the booking site. That's it.

### Example

Heading to the beach? Let's see.

```
$ qpws-camper --date 2021-05-01 --facility "MV Sarawak"
┌─────────┬──────────────────┬─────────────────┐
│ (index) │       date       │ sites_available │
├─────────┼──────────────────┼─────────────────┤
│    0    │ 'Sat, 1/5/2021'  │       218       │
│    1    │ 'Sun, 2/5/2021'  │       229       │
│    2    │ 'Mon, 3/5/2021'  │        0        │
│    3    │ 'Tue, 4/5/2021'  │        0        │
│    4    │ 'Wed, 5/5/2021'  │        0        │
│    5    │ 'Thu, 6/5/2021'  │        0        │
│    6    │ 'Fri, 7/5/2021'  │        0        │
│    7    │ 'Sat, 8/5/2021'  │       248       │
│    8    │ 'Sun, 9/5/2021'  │       242       │
│    9    │ 'Mon, 10/5/2021' │       242       │
│   10    │ 'Tue, 11/5/2021' │       242       │
│   11    │ 'Wed, 12/5/2021' │       242       │
│   12    │ 'Thu, 13/5/2021' │       242       │
│   13    │ 'Fri, 14/5/2021' │       240       │
└─────────┴──────────────────┴─────────────────┘
```

## Bugs?

qpws-camper interacts directly with the booking service UI, clicking buttons and such as if it were a real human getting ready for a really nice camping trip! This means it has a few limitations and can be a bit brittle. If it fails for you, please open an issue. I can't promise I'll fix it, but it's better to keep track of these things.

There are two important flags. `--verbose` logs which steps have been taken so far. `--debug-browser` opens the browser in "headed" mode so that you can watch it do its thing (it's fast)! Both flags might yield useful information for when opening an issue.
