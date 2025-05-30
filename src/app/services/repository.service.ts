import {Injectable} from '@angular/core';
import {RepositoryKey} from '../models/enums';
import {map, of} from "rxjs";
import {IFinishCategory, IFinisher, IRacer, IStarter, ISyncJSON} from "../models/interfaces";
import {GoogleTableService} from "./google-table.service";
import {DEFAULT_ITT_RACE_NAME} from "../constants/itt.constants";


@Injectable({
  providedIn: 'root'
})
export class RepositoryService {

  constructor(
    private googleTableService: GoogleTableService,
  ) {
  }

  private convertCategoryName(registerCategoryName: string): string {
    switch (registerCategoryName) {
      case 'МТБ':
        return 'МТБ'
      case 'Шоссе (групповой велосипед)':
        return 'Шоссе'
      case 'Шоссе (разделочник или групповой с лежаком)':
        return 'Шоссе ТТ'
      case 'Девушки':
        return 'Девушки'
      case 'Ветераны':
        return 'Ветераны'
      default:
        return 'Без категории'
    }
  }

  /**
   * Update
   */

  public updateRacers(value: IRacer[]) {
    window.localStorage.setItem(RepositoryKey.racers, JSON.stringify(value));
  }

  public updateCategoriesMap(value: Record<string, IRacer[]>) {
    window.localStorage.setItem(RepositoryKey.categoriesMap, JSON.stringify(value));
  }

  public updateStartedRacers(value: IStarter[]) {
    window.localStorage.setItem(RepositoryKey.starters, JSON.stringify(value));
  }

  public updateStarterNameList(value: string[]) {
    window.localStorage.setItem(RepositoryKey.starterNameList, JSON.stringify(value));
  }

  public updateFinishers(value: IFinisher[]) {
    window.localStorage.setItem(RepositoryKey.finishers, JSON.stringify(value));
  }

  public updateFinishersByCategories(value: IFinishCategory[]) {
    window.localStorage.setItem(RepositoryKey.finishersByCategories, JSON.stringify(value));
  }

  public updateAnons(value: IFinisher[]) {
    window.localStorage.setItem(RepositoryKey.anons, JSON.stringify(value));
  }

  public updateFinisherNameList(value: string[]) {
    window.localStorage.setItem(RepositoryKey.finisherNameList, JSON.stringify(value));
  }

  public updateCurrentRacerIndex(value: number) {
    window.localStorage.setItem(RepositoryKey.currentRacerIndex, JSON.stringify(value));
  }

  public updateCurrentAnonIndex(value: number) {
    window.localStorage.setItem(RepositoryKey.currentAnonIndex, JSON.stringify(value));
  }

  public updateRaceName(value: string) {
    window.localStorage.setItem(RepositoryKey.raceName, JSON.stringify(value));
  }

  /**
   * Read
   */

  public readRacers() {
    return JSON.parse(window.localStorage.getItem(RepositoryKey.racers)!);
  }

  public readCategoriesMap() {
    return JSON.parse(window.localStorage.getItem(RepositoryKey.categoriesMap)!);
  }

  public readStartedRacers() {
    return JSON.parse(window.localStorage.getItem(RepositoryKey.starters)!);
  }

  public readStarterNameList() {
    return JSON.parse(window.localStorage.getItem(RepositoryKey.starterNameList)!);
  }

  public readCurrentRacerIndex() {
    return JSON.parse(window.localStorage.getItem(RepositoryKey.currentRacerIndex)!);
  }

  public readCurrentAnonIndex() {
    return JSON.parse(window.localStorage.getItem(RepositoryKey.currentAnonIndex)!);
  }

  public readFinishers() {
    return JSON.parse(window.localStorage.getItem(RepositoryKey.finishers)!);
  }

  public readFinishersByCategories() {
    return JSON.parse(window.localStorage.getItem("finishersByCategories")!);
  }

  public readAnons() {
    return JSON.parse(window.localStorage.getItem(RepositoryKey.anons)!);
  }

  public readFinisherNameList() {
    return JSON.parse(window.localStorage.getItem(RepositoryKey.finisherNameList)!);
  }

  public readRaceName() {
    return JSON.parse(window.localStorage.getItem(RepositoryKey.raceName)!);
  }

  /**
   * Утилиты
   */

  public checkRacers(): boolean {
    return window.localStorage.getItem(RepositoryKey.racers) !== null;
  }

  public collectRaceData() {
    const racers = this.readRacers();
    const categoriesMap = this.readCategoriesMap();
    const starters = this.readStartedRacers();
    const starterNameList = this.readStarterNameList();
    const currentRacerIndex = this.readCurrentRacerIndex();
    const currentAnonIndex = this.readCurrentAnonIndex();
    const finishers = this.readFinishers();
    const finishersByCategories = this.readFinishersByCategories();
    const anons = this.readAnons();
    const finisherNameList = this.readFinisherNameList();
    const raceName = this.readRaceName();

    return {
      raceName: raceName ? raceName : DEFAULT_ITT_RACE_NAME,
      racers: racers ? racers : [],
      categoriesMap: categoriesMap ? categoriesMap : {},
      starters: starters ? starters : [],
      starterNameList: starterNameList ? starterNameList : [],
      currentRacerIndex: currentRacerIndex ? currentRacerIndex : 0,
      currentAnonIndex: currentAnonIndex ? currentAnonIndex : 0,
      finishers: finishers ? finishers : [],
      finishersByCategories: finishersByCategories ? finishersByCategories : [],
      anons: anons ? anons : [],
      finisherNameList: finisherNameList ? finisherNameList : []
    };
  }

  public setStateFromJSON(data: ISyncJSON) {
    this.updateRacers(data.racers);
    this.updateCategoriesMap(data.categoriesMap);
    this.updateStartedRacers(data.starters);
    this.updateStarterNameList(data.starterNameList);
    this.updateCurrentRacerIndex(data.currentRacerIndex);
    this.updateCurrentAnonIndex(data.currentAnonIndex);
    this.updateFinishers(data.finishers);
    this.updateFinishersByCategories(data.finishersByCategories);
    this.updateAnons(data.anons);
    this.updateFinisherNameList(data.finisherNameList);
    this.updateRaceName(data.raceName);
  }

  public readRacersDataFromGoogleSheet(url: string) {
    const id = this.googleTableService.extractGoogleSheetId(url);

    if (id === null) return of({racers: [], categoriesMap: {}});

    return this.googleTableService.getSheetData(id).pipe(
      map((data) => {
        const racers: IRacer[] = [];
        const categoriesMap: Record<string, IRacer[]> = {};

        data.forEach((registerInfo) => {
          const racer = {
            name: registerInfo.Name,
            category: this.convertCategoryName(registerInfo.Category),
            number: null
          }
          racers.push(racer);
          if (Array.isArray(categoriesMap[racer.category])) {
            categoriesMap[racer.category].push(racer);
          } else {
            categoriesMap[racer.category] = [];
            categoriesMap[racer.category].push(racer);
          }
        });

        this.updateCategoriesMap(categoriesMap);
        this.updateRacers(racers);

        return {racers, categoriesMap};
      }),
    )
  }

  public resetLS() {
    window.localStorage.clear();
  }
}
