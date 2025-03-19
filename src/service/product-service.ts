export const fakeFetchProducts = () => {
  return new Promise<Product[]>((resolve) => {
    setTimeout(() => {
      const newProducts = Array.from({ length: 6 }, (_, index) => ({
        ...emptyProduct,
        loading: false,
        position: index + 1,
        imageUrl: `${(Math.random() * 10 + 1) | 0}.svg`,
        displayName: "Product premium protection medium " + Math.random().toString(36).substring(2, 15),
        usps: [
          "✅ Lorem ipsum 2.500 € dolor",
          "✅ Takimataclita: et",
          "✅ Nonumy eirmod Tempor ",
          "❌ Est Sadipsidorles",
          "✅ Eirmotempor Invidunt",
        ],
        price: Math.random() * 1000,
        priceInfo: "est Nora jakobin tandare",
        grade: (Math.random() * 1.3 + 1).toFixed(1),
        selected: null,
      }));

      resolve(newProducts);
    }, (1000 + Math.random() * 1000) | 0);
  });
};

export type Product = {
  loading: boolean;
  position: number;

  imageUrl: string;
  displayName: string;
  usps: string[];

  price: number;
  priceInfo: string;
  grade: string;
};

export const emptyProduct: Product = {
  loading: true,
  position: 0,

  imageUrl: "",
  displayName: "",
  usps: ["", "", "", "", ""],

  price: 0,
  priceInfo: "",
  grade: "",
};
