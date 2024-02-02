import { StateCreator } from 'zustand'

import { serialAsync } from '~/shared'

import { communityService } from '../services/CommunityService.js'
import { CommunityStore, Store } from './types.js'

export const createCommunityStore: StateCreator<
  Store,
  [['zustand/immer', never]],
  [],
  CommunityStore
> = (set, get) => ({
  communityInfo: {
    selectedCommunity: null,
    communities: [],
    fetchCommunities: serialAsync(async () => {
      await get().tryRun(async () => {
        const communities = await communityService.getCommunities()
        const selectedCommunity = communities.find((c) => c.selected) ?? null
        set((s) => {
          s.communityInfo.communities = communities
          s.communityInfo.selectedCommunity = selectedCommunity
        })
      })
    }),
    selectCommunity: serialAsync(async (url: string) => {
      await get().tryRun(async () => {
        await communityService.selectCommunity(url)
        await get().refreshCache()
      })
    }),
  },
})
