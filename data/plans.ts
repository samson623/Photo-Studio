
import { Plan, PlanTier } from '../types';

export const PLANS: Record<PlanTier, Plan> = {
  Free: {
    name: 'Free',
    price: 0,
    imagesIncluded: 3,
    videoSecondsIncluded: 5,
  },
  Starter: {
    name: 'Starter',
    price: 10,
    imagesIncluded: 100,
    videoSecondsIncluded: 40,
  },
  Creator: {
    name: 'Creator',
    price: 20,
    imagesIncluded: 200,
    videoSecondsIncluded: 100,
  },
  Pro: {
    name: 'Pro',
    price: 50,
    imagesIncluded: 500,
    videoSecondsIncluded: 300,
  },
};