export enum ParameterChoice {
  Param1 = 0,
  Param2,
  Param3
}

export interface Vote {
  points: number
  voter: string
  parameter: ParameterChoice
}
