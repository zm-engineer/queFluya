import type { TopicPair } from './types'
import { numbersAndPrices } from './beginner/numbers-and-prices'
import { tellingTheTime } from './beginner/telling-the-time'
import { familyAndPeople } from './beginner/family-and-people'
import { directions } from './beginner/directions'
import { dailyRoutine } from './beginner/daily-routine'

// Every authored topic pair. Add new topics here; run `npm run build:topics`
// to regenerate supabase/topics_seed.generated.sql.
export const TOPIC_PAIRS: TopicPair[] = [
  numbersAndPrices,
  tellingTheTime,
  familyAndPeople,
  directions,
  dailyRoutine,
]
