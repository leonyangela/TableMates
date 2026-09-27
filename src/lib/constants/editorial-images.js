// Editorial photography for the homepage, all from Unsplash (Unsplash
// License). Credits are listed in README.md > Image Credits.
const unsplash = (id) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&q=80`;

export const EDITORIAL_IMAGES = {
  // Maria Moroz: a dining room glimpsed between curtains.
  curtain: {
    src: unsplash("1707334724033-e997675f8c10"),
    alt: "A candlelit dining room seen between parted curtains",
  },
  // Julia Vivcharyk: a pan catching flame.
  flame: {
    src: unsplash("1717321302149-3c6c9c76de67"),
    alt: "A cook tossing a pan as it bursts into flame",
  },
  // Stefan Vladimirov: shared plates from above.
  plates: {
    src: unsplash("1547573854-74d2a71d0826"),
    alt: "Shared plates spread across a wooden table, seen from above",
  },
  // M F: a long candlelit table.
  longTable: {
    src: unsplash("1536392706976-e486e2ba97af"),
    alt: "A long table set with candles and flowers in a dark room",
  },
  // Al Elmes: raised glasses.
  toast: {
    src: unsplash("1527529482837-4698179dc6ce"),
    alt: "Friends raising their glasses across a table",
  },
  // takahiro taguchi: a lamp-lit dining room.
  lamps: {
    src: unsplash("1552960226-639240203497"),
    alt: "A dark dining room lit by small table lamps",
  },
};
