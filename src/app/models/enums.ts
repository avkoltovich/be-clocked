export enum ModifyMode {
  edit = 'edit',
  create = 'create',
}

export enum RepositoryKey {
  racers = "racers",
  categoriesMap = "categoriesMap",
  starters = "starters",
  starterNameList =  "starterNameList",
  finishers = "finishers",
  finishersByCategories = "finishersByCategories",
  anons = "anons",
  finisherNameList =  "finisherNameList",
  currentRacerIndex = "currentRacerIndex",
  currentAnonIndex =  "currentAnonIndex",
  raceName =  "raceName",
  racersDelta = "racersDelta",
}

export enum RaceStatus {
  prepare = 'prepare',
  pause = 'pause',
  start = 'start',
  finish = 'finish',
  ready = 'ready',
}
