import type { TopicPair } from './types'
import { numbersAndPrices } from './beginner/numbers-and-prices'
import { tellingTheTime } from './beginner/telling-the-time'
import { familyAndPeople } from './beginner/family-and-people'
import { directions } from './beginner/directions'
import { dailyRoutine } from './beginner/daily-routine'
import { atTheAirport } from './intermediate/at-the-airport'
import { atWork } from './intermediate/at-work'
import { atTheDoctor } from './intermediate/at-the-doctor'
import { makingPlans } from './intermediate/making-plans'
import { atTheHotel } from './intermediate/at-the-hotel'
import { shoppingAndReturns } from './intermediate/shopping-and-returns'
import { theWeather } from './intermediate/the-weather'
import { gettingAround } from './intermediate/getting-around'

// Every authored topic pair. Add new topics here; run `npm run build:topics`
// to regenerate supabase/topics_seed.generated.sql.
export const TOPIC_PAIRS: TopicPair[] = [
  // Beginner
  numbersAndPrices,
  tellingTheTime,
  familyAndPeople,
  directions,
  dailyRoutine,
  // Intermediate
  atTheAirport,
  atWork,
  atTheDoctor,
  makingPlans,
  atTheHotel,
  shoppingAndReturns,
  theWeather,
  gettingAround,
]
