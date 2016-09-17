import { Vote } from "./vote.model";

export interface Project {
  name: string
  id: number
  vote?: Vote
  votesCount?: number
  points?: {value: number}[]
  rating?: number
}
