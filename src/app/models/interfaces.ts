export interface IFinisher {
  name: string;
  time: number;
}

export interface IFinishCategory {
  name: string;
  finishers: IFinisher[];
}

export interface IRacer {
  name: string;
  category: string;
  number: number;
  startNumber?: number;
}

export interface IStarter {
  name: string;
  time: number;
}

export interface ISyncJSON {
  name: string;
  racers: IRacer[];
  categoriesMap: Record<string, IRacer[]>;
  starters: IStarter[];
  starterNameList: string[];
  currentRacerIndex: number;
  currentAnonIndex: number;
  finishers: IFinisher[];
  finishersByCategories: IFinishCategory[];
  anons: IFinisher[];
  finisherNameList: string[];
}
