import { featureFlagsRepository } from "../repositories/featureFlagsRepository.js";

const builtInFlags = ["promotions", "popular", "new_arrivals"];

export const featureFlagsService = {
  async listFlags() {
    await Promise.all(builtInFlags.map((key) => featureFlagsRepository.ensureEnabled(key)));
    return featureFlagsRepository.findAll();
  },

  async getFlag(key: string) {
    if (builtInFlags.includes(key)) {
      return featureFlagsRepository.ensureEnabled(key);
    }
    return featureFlagsRepository.findByKey(key);
  },

  async createFlag(input: { key: string; enabled?: boolean; description?: string }) {
    const { key, enabled } = input;
    const flag = await featureFlagsRepository.create({
      key,
      enabled: enabled ?? false,
    });

    return flag;
  },

  async updateFlag(key: string, input: { key?: string; enabled?: boolean; description?: string }) {
    const data = input.enabled === undefined ? {} : { enabled: input.enabled };
    const flag = await featureFlagsRepository.updateByKey(key, data);

    return flag;
  },

  async deleteFlag(key: string) {
    await featureFlagsRepository.deleteByKey(key);
  },
};
