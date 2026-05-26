import { type Activity, getAllActivities } from './storage';

const CATEGORY_WEIGHTS: Record<string, number> = {
  doing: 5,
  watching: 2,
  treat: 3,
  wildcard: 2
};

export function getActivityWeight(activity: Activity): number {
  const baseWeight = CATEGORY_WEIGHTS[activity.category] || 2;
  
  if (activity.isCustom) {
    // Custom activities are scaled based on user's healthy/not tag
    if (activity.isHealthy) {
      return baseWeight * 1.5; // Encouraged custom activity
    } else {
      return baseWeight * 0.6; // Discouraged / less healthy custom treat
    }
  }

  // Default activities
  if (activity.isHealthy) {
    return baseWeight;
  } else {
    return baseWeight * 0.8; // default treats are slightly less likely
  }
}

export interface WeightedActivity extends Activity {
  weight: number;
}

export function getWeightedActivities(): WeightedActivity[] {
  const list = getAllActivities();
  return list.map(item => ({
    ...item,
    weight: getActivityWeight(item)
  }));
}

export function pickRandomActivity(): Activity {
  const weightedList = getWeightedActivities();
  const totalWeight = weightedList.reduce((sum, item) => sum + item.weight, 0);
  
  if (totalWeight <= 0) {
    // Fallback if list is somehow empty
    return { id: 'fallback', text: 'Stare at the sky for 5 minutes', category: 'wildcard', isHealthy: true };
  }

  let random = Math.random() * totalWeight;
  for (const item of weightedList) {
    random -= item.weight;
    if (random <= 0) {
      return item;
    }
  }

  return weightedList[weightedList.length - 1];
}
