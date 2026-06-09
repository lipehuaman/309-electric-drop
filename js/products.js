/* =====================================================================
   309 TECHNOLOGY · PRODUCT DATA
   Single source for the drop. Cards and the product detail view are both
   generated from this array (no duplicated markup). Editions match the
   brand book. Garment media is a looping product video where available;
   the hoodie falls back to the coded SVG mockup until its video lands.
   Colourways stay strictly within palette (black / white / electric green).
   ===================================================================== */

window.PRODUCTS = [
  {
    id: "tee-black",
    name: "Black-Edition Tee",
    edition: "BLAC_EDITION",
    price: 49,
    garment: "tee",
    body: "var(--brand-black)",
    ink: "var(--brand-green)",
    swatch: "#000000",
    sizes: ["S", "M", "L"],
    status: "available",
    tagKey: "tag.drop",
    video: "assets/products/tee-black.mp4",
    poster: "assets/products/tee-black.jpg",
    copy: {
      en: {
        desc: "Heavyweight black tee carrying the 309 mark in electric green. The everyday edition of the system.",
        fabric: "100% combed cotton, 220 gsm",
        features: ["Screen-printed 309 mark", "Ribbed crew neck", "Pre-shrunk, garment washed"],
        made: "Printed in Lima, PE"
      },
      es: {
        desc: "Polo negro de gramaje pesado con el sello 309 en verde electrico. La edicion diaria del sistema.",
        fabric: "100% algodon peinado, 220 gsm",
        features: ["Sello 309 serigrafiado", "Cuello redondo acanalado", "Pre-encogido, lavado en prenda"],
        made: "Estampado en Lima, PE"
      }
    }
  },
  {
    id: "tee-green",
    name: "Electric-Green Tee",
    edition: "ELECTRIC_GREEN",
    price: 49,
    garment: "tee",
    body: "var(--brand-green)",
    ink: "var(--brand-black)",
    swatch: "#58ff00",
    sizes: ["S", "M", "L"],
    status: "available",
    tagKey: "tag.signature",
    video: "assets/products/tee-green.mp4",
    poster: "assets/products/tee-green.jpg",
    copy: {
      en: {
        desc: "Electric-green tee carrying the 309 mark in black. The signature colourway, loud on purpose.",
        fabric: "100% combed cotton, 220 gsm",
        features: ["Screen-printed 309 mark", "Ribbed crew neck", "High-saturation reactive dye"],
        made: "Printed in Lima, PE"
      },
      es: {
        desc: "Polo verde electrico con el sello 309 en negro. El color insignia, fuerte a proposito.",
        fabric: "100% algodon peinado, 220 gsm",
        features: ["Sello 309 serigrafiado", "Cuello redondo acanalado", "Tinte reactivo de alta saturacion"],
        made: "Estampado en Lima, PE"
      }
    }
  },
  {
    id: "hoodie-black",
    name: "Black-Edition Hoodie",
    edition: "BLAC_EDITION",
    price: 89,
    garment: "hoodie",
    body: "var(--brand-black)",
    ink: "var(--brand-white)",
    swatch: "#000000",
    sizes: ["S", "M", "L"],
    status: "soldout",
    tagKey: "tag.soldout",
    video: "assets/products/hoodie-black.mp4",
    poster: "assets/products/hoodie-black.jpg",
    copy: {
      en: {
        desc: "Heavyweight black hoodie carrying the 309 mark in white. Built for the people who give the command.",
        fabric: "380 gsm brushed cotton fleece",
        features: ["Embroidered 309 mark", "Kangaroo pocket", "Double-lined hood"],
        made: "Printed in Lima, PE"
      },
      es: {
        desc: "Hoodie negro de gramaje pesado con el sello 309 en blanco. Hecho para quienes dan la orden.",
        fabric: "Felpa de algodon cepillada, 380 gsm",
        features: ["Sello 309 bordado", "Bolsillo canguro", "Capucha de doble forro"],
        made: "Estampado en Lima, PE"
      }
    }
  }
];
