const ColorNames = (function () {
  const dictionary = [
    ["000000", "Black"],
    ["0B1304", "Black Olive"],
    ["0C0D0F", "Vampire Black"],
    ["101720", "Dark Denim"],
    ["1A1110", "Licorice"],
    ["1B1B1B", "Eerie Black"],
    ["1F2937", "Gray 800"],
    ["222222", "Nero"],
    ["2A2B2A", "Graphite"],
    ["2B1B17", "Midnight Brown"],
    ["2C3E50", "Midnight Blue"],
    ["2E4053", "Stormy Sea"],
    ["333333", "Dark Charcoal"],
    ["34495E", "Wet Asphalt"],
    ["36454F", "Charcoal"],
    ["3D52A0", "Indigo Ink"],
    ["4682B4", "Steel Blue"],
    ["4A5568", "Slate Gray"],
    ["4B0082", "Indigo"],
    ["546E7A", "Blue Grey"],
    ["5C6BC0", "Soft Indigo"],
    ["5E4955", "Mauve Shadow"],
    ["5F9EA0", "Cadet Blue"],
    ["607D8B", "Blue Grey"],
    ["663399", "Rebecca Purple"],
    ["6A5ACD", "Slate Blue"],
    ["708090", "Slate Gray"],
    ["708238", "Olive Drab"],
    ["795548", "Brown Clay"],
    ["7B1FA2", "Purple Haze"],
    ["7E57C2", "Deep Lavender"],
    ["7F8C8D", "Asbestos"],
    ["800000", "Maroon"],
    ["800080", "Purple"],
    ["808000", "Olive"],
    ["808080", "Gray"],
    ["87CEEB", "Sky Blue"],
    ["8A2BE2", "Blue Violet"],
    ["8D6E63", "Warm Taupe"],
    ["8E44AD", "Wisteria"],
    ["95A5A6", "Silver Sand"],
    ["996888", "Dusty Lavender"],
    ["9C27B0", "Amethyst Purple"],
    ["9E9E9E", "Dusty Gray"],
    ["A52A2A", "Brown"],
    ["A8DADC", "Powder Blue"],
    ["AB47BC", "Lilac Bloom"],
    ["B0BEC5", "Cool Mist"],
    ["B22222", "Firebrick"],
    ["B8860B", "Dark Goldenrod"],
    ["BA68C8", "Muted Orchid"],
    ["BC8F8F", "Rosy Brown"],
    ["BDC3C7", "Silver Dust"],
    ["C0392B", "Pomegranate"],
    ["C0C0C0", "Silver"],
    ["C2185B", "Deep Raspberry"],
    ["C5CAE9", "Lavender Mist"],
    ["C6DDF0", "Pale Sky"],
    ["C99DA3", "Rosy Taupe"],
    ["CD5C5C", "Indian Red"],
    ["CD853F", "Peru"],
    ["CFD8DC", "Ice Gray"],
    ["D2691E", "Chocolate"],
    ["D2B48C", "Tan"],
    ["D35400", "Pumpkin"],
    ["D8BFD8", "Thistle"],
    ["DA70D6", "Orchid"],
    ["DC143C", "Crimson"],
    ["DDA0DD", "Plum"],
    ["DEB887", "Burlywood"],
    ["E0E0E0", "Platinum Gray"],
    ["E1BEE7", "Soft Lilac"],
    ["E2E8F0", "Light Slate"],
    ["E67E22", "Carrot Orange"],
    ["E74C3C", "Alizarin"],
    ["E8EAF6", "Pale Iris"],
    ["E91E63", "Neon Blush"],
    ["EC407A", "Pink Rose"],
    ["EE82EE", "Violet"],
    ["EF5350", "Coral Sunset"],
    ["F08080", "Light Coral"],
    ["F1948A", "Muted Salmon"],
    ["F1C40F", "Sun Yellow"],
    ["F39C12", "Orange Amber"],
    ["F44336", "Bright Crimson"],
    ["F48FB1", "Cotton Candy"],
    ["F5F5DC", "Beige"],
    ["F8BBD0", "Pastel Blossom"],
    ["F9EBEA", "Soft Blush"],
    ["FA8072", "Salmon"],
    ["FADBD8", "Blush Pink"],
    ["FB8C00", "Vivid Amber"],
    ["FF0000", "Pure Red"],
    ["FF1493", "Deep Pink"],
    ["FF4500", "Orange Red"],
    ["FF6347", "Tomato"],
    ["FF69B4", "Hot Pink"],
    ["FF7043", "Tangerine Coral"],
    ["FF7F50", "Coral"],
    ["FF8C00", "Dark Orange"],
    ["FFA07A", "Light Salmon"],
    ["FFA500", "Orange"],
    ["FFB6C1", "Light Pink"],
    ["FFC0CB", "Pink"],
    ["FFD700", "Gold"],
    ["FFDAB9", "Peach Puff"],
    ["FFDEAD", "Navajo White"],
    ["FFE4B5", "Moccasin"],
    ["FFE4C4", "Bisque"],
    ["FFE4E1", "Misty Rose"],
    ["FFFF00", "Yellow"],
    ["FFFFFF", "White"],
    ["001F3F", "Navy Blue"],
    ["0074D9", "Blue Accent"],
    ["7FDBFF", "Aqua Sky"],
    ["39CCCC", "Teal Breeze"],
    ["3D9970", "Olive Green"],
    ["2ECC40", "Spring Green"],
    ["01FF70", "Lime Neon"],
    ["FFDC00", "Canary Yellow"],
    ["85144B", "Wine Red"],
    ["F012BE", "Electric Magenta"],
    ["B10DC9", "Deep Royal Purple"],
    ["00CED1", "Dark Turquoise"],
    ["20B2AA", "Light Sea Green"],
    ["008080", "Teal"],
    ["00FFFF", "Cyan"],
    ["40E0D0", "Turquoise"],
    ["1E90FF", "Dodger Blue"],
    ["00BFFF", "Deep Sky Blue"],
    ["4169E1", "Royal Blue"],
    ["0000FF", "Blue"],
    ["2E8B57", "Sea Green"],
    ["3CB371", "Medium Sea Green"],
    ["00FF00", "Lime"],
    ["32CD32", "Lime Green"],
    ["228B22", "Forest Green"],
    ["008000", "Green"],
    ["264653", "Deep Jungle Green"],
    ["2A9D8F", "Persian Green"],
    ["E9C46A", "Saffron Gold"],
    ["F4A261", "Sandy Sunset"],
    ["E76F51", "Burnt Sienna"],
    ["1D3557", "Prussian Blue"],
    ["457B9D", "Celadon Sea"],
    ["606C38", "Moss Green"],
    ["283618", "Pakistani Green"],
    ["DDA15E", "Earth Yellow"],
    ["BC6C25", "Liver Chestnut"],
    ["001D3D", "Dark Navy"],
    ["2B2D42", "Space Cadet"],
    ["8D99AE", "Cool Pewter"],
    ["EF233C", "Vibrant Red"]
  ];

  function hexToRgb(hex) {
    hex = hex.replace("#", "");
    if (hex.length === 3) {
      hex = hex.split("").map((c) => c + c).join("");
    }
    const val = parseInt(hex, 16);
    return {
      r: (val >> 16) & 255,
      g: (val >> 8) & 255,
      b: val & 255
    };
  }

  const database = dictionary.map(([hex, name]) => ({
    hex: hex.toUpperCase(),
    name,
    rgb: hexToRgb(hex)
  }));

  function getName(hex) {
    const cleanHex = hex.replace("#", "").toUpperCase();
    const targetRgb = hexToRgb(cleanHex);
    if (isNaN(targetRgb.r)) return "Custom Color";

    let closest = database[0];
    let minDistance = Infinity;

    for (let i = 0; i < database.length; i++) {
      const item = database[i];
      if (item.hex === cleanHex) return item.name;

      const deltaRed = targetRgb.r - item.rgb.r;
      const deltaGreen = targetRgb.g - item.rgb.g;
      const deltaBlue = targetRgb.b - item.rgb.b;
      const redMean = (targetRgb.r + item.rgb.r) / 2;

      const distance = Math.sqrt(
        (2 + redMean / 256) * deltaRed * deltaRed +
        4 * deltaGreen * deltaGreen +
        (2 + (255 - redMean) / 256) * deltaBlue * deltaBlue
      );

      if (distance < minDistance) {
        minDistance = distance;
        closest = item;
      }
    }

    return closest.name;
  }

  return { getName };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = ColorNames;
}
