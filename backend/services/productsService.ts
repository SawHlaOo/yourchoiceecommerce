import { productsRepository } from "../repositories/productsRepository.js";

const defaults = {
  image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80",
  logo: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80",
};

export const productsService = {
  async listGames() {
    return productsRepository.listGames();
  },

  async getGame(id: number) {
    return productsRepository.findGameById(id);
  },

  async listApps() {
    return productsRepository.listApps();
  },

  async getApp(id: number) {
    return productsRepository.findAppById(id);
  },

  async listPowerPoints() {
    return productsRepository.listPowerPoints();
  },

  async getPowerPoint(id: number) {
    return productsRepository.findPowerPointById(id);
  },

  async createGame(input: { name: string; description?: string; image?: string; logo?: string; badge?: string }) {
    return productsRepository.createGame({
      name: input.name,
      description: input.description,
      badge: input.badge,
      image: input.image || defaults.image,
      logo: input.logo || defaults.logo,
    });
  },

  async updateGame(id: number, data: any) {
    return productsRepository.updateGame(id, data);
  },

  async deleteGame(id: number) {
    await productsRepository.deleteGame(id);
  },

  async createApp(input: { name: string; description?: string; image?: string; logo?: string; badge?: string }) {
    return productsRepository.createApp({
      name: input.name,
      description: input.description,
      badge: input.badge,
      image: input.image || defaults.image,
      logo: input.logo || defaults.logo,
    });
  },

  async updateApp(id: number, data: any) {
    return productsRepository.updateApp(id, data);
  },

  async deleteApp(id: number) {
    await productsRepository.deleteApp(id);
  },

  async createPowerPoint(input: { name: string; description?: string; image?: string; logo?: string; badge?: string }) {
    return productsRepository.createPowerPoint({
      name: input.name,
      description: input.description,
      badge: input.badge,
      image: input.image || defaults.image,
      logo: input.logo || defaults.logo,
    });
  },

  async updatePowerPoint(id: number, data: any) {
    return productsRepository.updatePowerPoint(id, data);
  },

  async deletePowerPoint(id: number) {
    await productsRepository.deletePowerPoint(id);
  },
};
