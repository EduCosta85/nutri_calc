/**
 * Subset of TACO (Tabela Brasileira de Composicao de Alimentos) - UNICAMP/NEPA
 * Values per 100g. Sodium in mg, all others in g or kcal.
 * Fields: name, cal, carb, sugT, sugA, prot, fatT, fatS, fatTr, fib, sod
 * sugA (added sugars) = 0 for all raw ingredients (only processed foods have added sugars)
 */
export interface TacoItem {
  name: string;
  cal: number;
  carb: number;
  sugT: number;
  sugA: number;
  prot: number;
  fatT: number;
  fatS: number;
  fatTr: number;
  fib: number;
  sod: number;
}

export const TACO_DATA: readonly TacoItem[] = [
  // Cereais e farinhas
  { name: "Arroz branco cozido", cal: 128, carb: 28.1, sugT: 0, sugA: 0, prot: 2.5, fatT: 0.2, fatS: 0.1, fatTr: 0, fib: 1.6, sod: 1 },
  { name: "Arroz integral cozido", cal: 124, carb: 25.8, sugT: 0.3, sugA: 0, prot: 2.6, fatT: 1.0, fatS: 0.2, fatTr: 0, fib: 2.7, sod: 1 },
  { name: "Farinha de trigo", cal: 360, carb: 75.1, sugT: 0.7, sugA: 0, prot: 9.8, fatT: 1.4, fatS: 0.2, fatTr: 0, fib: 2.3, sod: 1 },
  { name: "Farinha de trigo integral", cal: 339, carb: 65.6, sugT: 0.6, sugA: 0, prot: 11.4, fatT: 1.9, fatS: 0.3, fatTr: 0, fib: 9.6, sod: 3 },
  { name: "Farinha de milho (fuba)", cal: 351, carb: 79.1, sugT: 1.3, sugA: 0, prot: 7.2, fatT: 1.5, fatS: 0.2, fatTr: 0, fib: 4.4, sod: 1 },
  { name: "Farinha de mandioca", cal: 361, carb: 89.2, sugT: 1.1, sugA: 0, prot: 1.2, fatT: 0.3, fatS: 0.1, fatTr: 0, fib: 6.4, sod: 2 },
  { name: "Farinha de aveia", cal: 394, carb: 66.6, sugT: 0.9, sugA: 0, prot: 14.0, fatT: 8.5, fatS: 1.5, fatTr: 0, fib: 9.1, sod: 4 },
  { name: "Aveia em flocos", cal: 394, carb: 66.6, sugT: 0.9, sugA: 0, prot: 13.9, fatT: 8.5, fatS: 1.5, fatTr: 0, fib: 9.1, sod: 4 },
  { name: "Amido de milho (maisena)", cal: 381, carb: 91.9, sugT: 0, sugA: 0, prot: 0.1, fatT: 0.1, fatS: 0, fatTr: 0, fib: 0.1, sod: 2 },
  { name: "Polvilho doce", cal: 351, carb: 87.0, sugT: 0, sugA: 0, prot: 0.5, fatT: 0.2, fatS: 0, fatTr: 0, fib: 0.4, sod: 1 },
  { name: "Polvilho azedo", cal: 351, carb: 87.0, sugT: 0, sugA: 0, prot: 0.5, fatT: 0.2, fatS: 0, fatTr: 0, fib: 0.4, sod: 1 },
  { name: "Macarrao cozido", cal: 102, carb: 19.9, sugT: 0.6, sugA: 0, prot: 3.4, fatT: 0.5, fatS: 0.1, fatTr: 0, fib: 1.5, sod: 1 },

  // Acucares e doces
  { name: "Acucar cristal", cal: 387, carb: 99.5, sugT: 99.5, sugA: 99.5, prot: 0.3, fatT: 0, fatS: 0, fatTr: 0, fib: 0, sod: 1 },
  { name: "Acucar mascavo", cal: 369, carb: 94.5, sugT: 94.5, sugA: 94.5, prot: 0.4, fatT: 0, fatS: 0, fatTr: 0, fib: 0, sod: 30 },
  { name: "Acucar demerara", cal: 376, carb: 97.3, sugT: 97.3, sugA: 97.3, prot: 0.2, fatT: 0, fatS: 0, fatTr: 0, fib: 0, sod: 3 },
  { name: "Mel", cal: 309, carb: 84.0, sugT: 82.0, sugA: 0, prot: 0.3, fatT: 0, fatS: 0, fatTr: 0, fib: 0, sod: 5 },
  { name: "Chocolate em po", cal: 378, carb: 77.4, sugT: 60.0, sugA: 55.0, prot: 5.2, fatT: 3.8, fatS: 2.3, fatTr: 0, fib: 5.6, sod: 21 },
  { name: "Cacau em po", cal: 312, carb: 36.2, sugT: 1.8, sugA: 0, prot: 22.4, fatT: 13.7, fatS: 8.1, fatTr: 0, fib: 33.2, sod: 21 },
  { name: "Leite condensado", cal: 321, carb: 55.3, sugT: 55.3, sugA: 55.3, prot: 7.4, fatT: 8.3, fatS: 5.2, fatTr: 0.2, fib: 0, sod: 130 },
  { name: "Coco ralado", cal: 572, carb: 18.5, sugT: 6.2, sugA: 0, prot: 5.5, fatT: 53.9, fatS: 47.8, fatTr: 0, fib: 15.3, sod: 20 },
  { name: "Leite de coco", cal: 182, carb: 3.4, sugT: 2.4, sugA: 0, prot: 1.6, fatT: 18.4, fatS: 16.3, fatTr: 0, fib: 0, sod: 12 },

  // Ovos e laticinios
  { name: "Ovo de galinha inteiro", cal: 143, carb: 1.6, sugT: 0.8, sugA: 0, prot: 13.0, fatT: 8.9, fatS: 3.1, fatTr: 0, fib: 0, sod: 140 },
  { name: "Clara de ovo", cal: 43, carb: 1.0, sugT: 0.7, sugA: 0, prot: 9.8, fatT: 0, fatS: 0, fatTr: 0, fib: 0, sod: 153 },
  { name: "Gema de ovo", cal: 352, carb: 1.6, sugT: 0.6, sugA: 0, prot: 16.3, fatT: 31.6, fatS: 10.0, fatTr: 0, fib: 0, sod: 48 },
  { name: "Leite integral", cal: 60, carb: 4.7, sugT: 4.7, sugA: 0, prot: 3.2, fatT: 3.3, fatS: 2.0, fatTr: 0.1, fib: 0, sod: 52 },
  { name: "Leite desnatado", cal: 35, carb: 4.9, sugT: 4.9, sugA: 0, prot: 3.4, fatT: 0.2, fatS: 0.1, fatTr: 0, fib: 0, sod: 52 },
  { name: "Leite em po integral", cal: 497, carb: 38.0, sugT: 38.0, sugA: 0, prot: 26.3, fatT: 26.7, fatS: 16.7, fatTr: 0.7, fib: 0, sod: 371 },
  { name: "Iogurte natural", cal: 51, carb: 5.5, sugT: 5.5, sugA: 0, prot: 4.1, fatT: 1.4, fatS: 0.9, fatTr: 0, fib: 0, sod: 52 },
  { name: "Creme de leite", cal: 221, carb: 3.5, sugT: 3.5, sugA: 0, prot: 2.0, fatT: 22.5, fatS: 14.1, fatTr: 0.6, fib: 0, sod: 32 },
  { name: "Requeijao cremoso", cal: 257, carb: 2.5, sugT: 2.5, sugA: 0, prot: 7.5, fatT: 24.5, fatS: 15.3, fatTr: 0.6, fib: 0, sod: 340 },
  { name: "Queijo mussarela", cal: 330, carb: 3.0, sugT: 1.0, sugA: 0, prot: 22.6, fatT: 25.2, fatS: 15.8, fatTr: 0.6, fib: 0, sod: 579 },
  { name: "Queijo parmesao", cal: 453, carb: 1.7, sugT: 0.8, sugA: 0, prot: 33.5, fatT: 34.4, fatS: 21.5, fatTr: 0.7, fib: 0, sod: 1602 },
  { name: "Queijo minas frescal", cal: 264, carb: 3.2, sugT: 2.5, sugA: 0, prot: 17.4, fatT: 20.2, fatS: 12.6, fatTr: 0.5, fib: 0, sod: 301 },

  // Gorduras e oleos
  { name: "Manteiga com sal", cal: 726, carb: 0, sugT: 0, sugA: 0, prot: 0.4, fatT: 82.4, fatS: 51.6, fatTr: 2.5, fib: 0, sod: 579 },
  { name: "Manteiga sem sal", cal: 726, carb: 0, sugT: 0, sugA: 0, prot: 0.4, fatT: 82.4, fatS: 51.6, fatTr: 2.5, fib: 0, sod: 11 },
  { name: "Margarina", cal: 540, carb: 0.1, sugT: 0, sugA: 0, prot: 0.1, fatT: 60.0, fatS: 15.0, fatTr: 6.0, fib: 0, sod: 800 },
  { name: "Oleo de soja", cal: 884, carb: 0, sugT: 0, sugA: 0, prot: 0, fatT: 100.0, fatS: 15.6, fatTr: 1.0, fib: 0, sod: 0 },
  { name: "Azeite de oliva", cal: 884, carb: 0, sugT: 0, sugA: 0, prot: 0, fatT: 100.0, fatS: 14.0, fatTr: 0, fib: 0, sod: 0 },
  { name: "Oleo de coco", cal: 862, carb: 0, sugT: 0, sugA: 0, prot: 0, fatT: 100.0, fatS: 86.5, fatTr: 0, fib: 0, sod: 0 },
  { name: "Banha de porco", cal: 898, carb: 0, sugT: 0, sugA: 0, prot: 0, fatT: 99.8, fatS: 39.9, fatTr: 0, fib: 0, sod: 0 },

  // Frutas
  { name: "Banana nanica", cal: 92, carb: 23.8, sugT: 15.4, sugA: 0, prot: 1.4, fatT: 0.1, fatS: 0, fatTr: 0, fib: 1.9, sod: 1 },
  { name: "Maca com casca", cal: 56, carb: 15.2, sugT: 13.3, sugA: 0, prot: 0.3, fatT: 0, fatS: 0, fatTr: 0, fib: 1.3, sod: 1 },
  { name: "Laranja pera", cal: 37, carb: 8.9, sugT: 8.2, sugA: 0, prot: 1.0, fatT: 0.1, fatS: 0, fatTr: 0, fib: 0.8, sod: 1 },
  { name: "Limao", cal: 32, carb: 11.1, sugT: 2.5, sugA: 0, prot: 0.9, fatT: 0.1, fatS: 0, fatTr: 0, fib: 1.2, sod: 1 },
  { name: "Morango", cal: 30, carb: 6.8, sugT: 5.3, sugA: 0, prot: 0.9, fatT: 0.3, fatS: 0, fatTr: 0, fib: 1.7, sod: 1 },
  { name: "Abacaxi", cal: 48, carb: 12.3, sugT: 9.9, sugA: 0, prot: 0.9, fatT: 0.1, fatS: 0, fatTr: 0, fib: 1.0, sod: 1 },
  { name: "Manga", cal: 64, carb: 16.7, sugT: 14.8, sugA: 0, prot: 0.4, fatT: 0.3, fatS: 0.1, fatTr: 0, fib: 1.6, sod: 1 },
  { name: "Maracuja (polpa)", cal: 68, carb: 12.3, sugT: 9.5, sugA: 0, prot: 2.0, fatT: 2.1, fatS: 0.2, fatTr: 0, fib: 1.1, sod: 8 },
  { name: "Acai (polpa)", cal: 58, carb: 6.2, sugT: 0, sugA: 0, prot: 0.8, fatT: 3.9, fatS: 0.8, fatTr: 0, fib: 2.6, sod: 5 },
  { name: "Goiaba vermelha", cal: 54, carb: 13.0, sugT: 8.9, sugA: 0, prot: 1.1, fatT: 0.4, fatS: 0.1, fatTr: 0, fib: 6.2, sod: 3 },

  // Legumes e verduras
  { name: "Cenoura crua", cal: 34, carb: 7.7, sugT: 3.2, sugA: 0, prot: 1.3, fatT: 0.2, fatS: 0, fatTr: 0, fib: 3.2, sod: 69 },
  { name: "Batata inglesa cozida", cal: 52, carb: 11.9, sugT: 0.8, sugA: 0, prot: 1.2, fatT: 0, fatS: 0, fatTr: 0, fib: 1.2, sod: 2 },
  { name: "Batata doce cozida", cal: 77, carb: 18.4, sugT: 5.7, sugA: 0, prot: 0.6, fatT: 0.1, fatS: 0, fatTr: 0, fib: 2.2, sod: 3 },
  { name: "Mandioca cozida", cal: 125, carb: 30.1, sugT: 1.4, sugA: 0, prot: 0.6, fatT: 0.3, fatS: 0.1, fatTr: 0, fib: 1.6, sod: 2 },
  { name: "Abobora cozida", cal: 18, carb: 4.3, sugT: 1.8, sugA: 0, prot: 0.8, fatT: 0.1, fatS: 0, fatTr: 0, fib: 1.6, sod: 1 },
  { name: "Tomate", cal: 15, carb: 3.1, sugT: 2.6, sugA: 0, prot: 1.1, fatT: 0.2, fatS: 0, fatTr: 0, fib: 1.2, sod: 5 },
  { name: "Cebola", cal: 39, carb: 8.9, sugT: 4.7, sugA: 0, prot: 1.7, fatT: 0.1, fatS: 0, fatTr: 0, fib: 2.2, sod: 2 },
  { name: "Alho", cal: 113, carb: 23.9, sugT: 1.0, sugA: 0, prot: 7.0, fatT: 0.2, fatS: 0, fatTr: 0, fib: 4.3, sod: 7 },
  { name: "Espinafre cozido", cal: 16, carb: 2.0, sugT: 0.2, sugA: 0, prot: 2.0, fatT: 0.2, fatS: 0, fatTr: 0, fib: 2.1, sod: 54 },

  // Leguminosas
  { name: "Feijao carioca cozido", cal: 76, carb: 13.6, sugT: 0.3, sugA: 0, prot: 4.8, fatT: 0.5, fatS: 0.1, fatTr: 0, fib: 8.5, sod: 2 },
  { name: "Feijao preto cozido", cal: 77, carb: 14.0, sugT: 0.3, sugA: 0, prot: 4.5, fatT: 0.5, fatS: 0.1, fatTr: 0, fib: 8.4, sod: 2 },
  { name: "Lentilha cozida", cal: 93, carb: 16.3, sugT: 1.0, sugA: 0, prot: 6.3, fatT: 0.5, fatS: 0.1, fatTr: 0, fib: 7.9, sod: 2 },
  { name: "Grao de bico cozido", cal: 130, carb: 18.3, sugT: 1.1, sugA: 0, prot: 6.7, fatT: 2.6, fatS: 0.3, fatTr: 0, fib: 5.1, sod: 5 },
  { name: "Soja cozida", cal: 151, carb: 8.5, sugT: 1.5, sugA: 0, prot: 14.0, fatT: 7.6, fatS: 1.1, fatTr: 0, fib: 5.6, sod: 1 },

  // Carnes
  { name: "Peito de frango cozido", cal: 159, carb: 0, sugT: 0, sugA: 0, prot: 32.0, fatT: 3.2, fatS: 0.9, fatTr: 0, fib: 0, sod: 51 },
  { name: "Carne bovina (acem) cozida", cal: 215, carb: 0, sugT: 0, sugA: 0, prot: 26.7, fatT: 12.1, fatS: 4.8, fatTr: 0.5, fib: 0, sod: 45 },
  { name: "Carne suina (lombo) assada", cal: 210, carb: 0, sugT: 0, sugA: 0, prot: 27.0, fatT: 11.0, fatS: 4.0, fatTr: 0, fib: 0, sod: 48 },
  { name: "Carne moida (patinho)", cal: 212, carb: 0, sugT: 0, sugA: 0, prot: 26.4, fatT: 11.7, fatS: 4.7, fatTr: 0.5, fib: 0, sod: 53 },
  { name: "Linguica calabresa", cal: 262, carb: 2.0, sugT: 0, sugA: 0, prot: 15.0, fatT: 21.7, fatS: 8.0, fatTr: 0.3, fib: 0, sod: 1149 },
  { name: "Presunto", cal: 80, carb: 1.2, sugT: 0, sugA: 0, prot: 14.8, fatT: 1.8, fatS: 0.6, fatTr: 0, fib: 0, sod: 1060 },
  { name: "Bacon", cal: 556, carb: 0, sugT: 0, sugA: 0, prot: 24.0, fatT: 51.0, fatS: 17.4, fatTr: 0.5, fib: 0, sod: 1440 },

  // Peixes
  { name: "Atum em conserva", cal: 166, carb: 0, sugT: 0, sugA: 0, prot: 26.2, fatT: 6.4, fatS: 1.2, fatTr: 0, fib: 0, sod: 396 },
  { name: "Sardinha em conserva", cal: 208, carb: 0, sugT: 0, sugA: 0, prot: 24.6, fatT: 11.5, fatS: 3.4, fatTr: 0, fib: 0, sod: 480 },

  // Oleaginosas
  { name: "Castanha de caju", cal: 570, carb: 29.1, sugT: 5.0, sugA: 0, prot: 18.5, fatT: 46.3, fatS: 8.1, fatTr: 0, fib: 3.7, sod: 9 },
  { name: "Amendoim torrado", cal: 606, carb: 18.7, sugT: 4.0, sugA: 0, prot: 27.2, fatT: 49.4, fatS: 7.5, fatTr: 0, fib: 7.8, sod: 5 },
  { name: "Castanha do para", cal: 643, carb: 15.1, sugT: 2.3, sugA: 0, prot: 14.5, fatT: 63.5, fatS: 15.1, fatTr: 0, fib: 7.9, sod: 2 },
  { name: "Noz", cal: 620, carb: 18.4, sugT: 2.6, sugA: 0, prot: 14.4, fatT: 59.4, fatS: 5.6, fatTr: 0, fib: 5.2, sod: 2 },

  // Temperos e condimentos
  { name: "Sal refinado", cal: 0, carb: 0, sugT: 0, sugA: 0, prot: 0, fatT: 0, fatS: 0, fatTr: 0, fib: 0, sod: 38758 },
  { name: "Fermento biologico", cal: 72, carb: 10.0, sugT: 3.0, sugA: 0, prot: 8.4, fatT: 0.7, fatS: 0.1, fatTr: 0, fib: 3.3, sod: 30 },
  { name: "Fermento em po quimico", cal: 81, carb: 33.0, sugT: 0, sugA: 0, prot: 0, fatT: 0, fatS: 0, fatTr: 0, fib: 0.1, sod: 9867 },
  { name: "Canela em po", cal: 261, carb: 55.5, sugT: 2.2, sugA: 0, prot: 3.9, fatT: 3.2, fatS: 0.3, fatTr: 0, fib: 36.6, sod: 26 },
  { name: "Gengibre", cal: 46, carb: 10.1, sugT: 1.7, sugA: 0, prot: 1.3, fatT: 0.2, fatS: 0.1, fatTr: 0, fib: 2.8, sod: 6 },
  { name: "Extrato de tomate", cal: 61, carb: 12.2, sugT: 9.0, sugA: 0, prot: 3.1, fatT: 0.4, fatS: 0.1, fatTr: 0, fib: 3.0, sod: 577 },

  // Bebidas base
  { name: "Agua de coco", cal: 22, carb: 5.3, sugT: 4.5, sugA: 0, prot: 0, fatT: 0, fatS: 0, fatTr: 0, fib: 0, sod: 40 },
  { name: "Suco de laranja natural", cal: 41, carb: 10.0, sugT: 8.4, sugA: 0, prot: 0.6, fatT: 0.1, fatS: 0, fatTr: 0, fib: 0, sod: 0 },

  // Massas prontas
  { name: "Pao frances", cal: 300, carb: 58.6, sugT: 3.1, sugA: 0, prot: 8.0, fatT: 3.1, fatS: 0.9, fatTr: 0.1, fib: 2.3, sod: 648 },
  { name: "Pao de forma integral", cal: 253, carb: 46.0, sugT: 5.0, sugA: 3.0, prot: 9.4, fatT: 3.7, fatS: 0.8, fatTr: 0, fib: 6.9, sod: 472 },
  { name: "Biscoito cream cracker", cal: 432, carb: 68.7, sugT: 2.0, sugA: 0, prot: 9.6, fatT: 14.4, fatS: 3.8, fatTr: 1.2, fib: 2.5, sod: 854 },

  // Proteina vegetal
  { name: "Tofu", cal: 64, carb: 2.5, sugT: 0.6, sugA: 0, prot: 6.6, fatT: 3.4, fatS: 0.5, fatTr: 0, fib: 0.2, sod: 7 },
  { name: "Proteina de soja texturizada (PTS)", cal: 296, carb: 26.0, sugT: 3.0, sugA: 0, prot: 46.0, fatT: 1.0, fatS: 0.2, fatTr: 0, fib: 16.0, sod: 2 },
] as const;
