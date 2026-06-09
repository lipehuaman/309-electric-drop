/* =====================================================================
   309 TECHNOLOGY · PRODUCT DATA
   Single source for the drop. ProductCard markup is generated from this
   array (no duplicated HTML). Editions match the brand book exactly:
   Black-Edition tee, Electric-Green tee, Black-Edition hoodie.
   Garment colourways drive the mockup tokens (positive / negative use).
   ===================================================================== */

window.PRODUCTS = [
  {
    id: "tee-black",
    name: "Black-Edition Tee",
    edition: "BLAC_EDITION",
    price: 49,
    garment: "tee",
    // garment fill / logo colour, strictly within palette
    body: "var(--brand-black)",
    ink: "var(--brand-green)",
    sizes: ["S", "M", "L"],
    status: "available",
    tagKey: "tag.drop"
  },
  {
    id: "tee-green",
    name: "Electric-Green Tee",
    edition: "ELECTRIC_GREEN",
    price: 49,
    garment: "tee",
    body: "var(--brand-green)",
    ink: "var(--brand-black)",
    sizes: ["S", "M", "L"],
    status: "available",
    tagKey: "tag.signature"
  },
  {
    id: "hoodie-black",
    name: "Black-Edition Hoodie",
    edition: "BLAC_EDITION",
    price: 89,
    garment: "hoodie",
    body: "var(--brand-black)",
    ink: "var(--brand-white)",
    sizes: ["S", "M", "L"],
    status: "soldout",
    tagKey: "tag.soldout"
  }
];
