import {Injectable} from '@angular/core';
import {RaceType, RepositoryKey} from '../models/enums';
import {IFinishCategory, IFinisher, IRacer, IStarter, ISyncJSON} from "../models/interfaces";
import {DEFAULT_RACE_NAME, DEFAULT_DELTA} from "../constants/itt.constants";


@Injectable({
  providedIn: 'root'
})
export class RepositoryService {
  /**
   * Update
   */

  public updateRacers(value: IRacer[]) {
    window.localStorage.setItem(RepositoryKey.RACERS, JSON.stringify(value));
  }

  public updateCategoriesMap(value: Record<string, IRacer[]>) {
    window.localStorage.setItem(RepositoryKey.CATEGORIES_MAP, JSON.stringify(value));
  }

  public updateStartedRacers(value: IStarter[]) {
    window.localStorage.setItem(RepositoryKey.STARTERS, JSON.stringify(value));
  }

  public updateSkippedRacers(value: number[]) {
    window.localStorage.setItem(RepositoryKey.SKIPPED_RACERS, JSON.stringify(value));
  }

  public updateStarterNameList(value: string[]) {
    window.localStorage.setItem(RepositoryKey.STARTER_NAME_LIST, JSON.stringify(value));
  }

  public updateFinishers(value: IFinisher[]) {
    window.localStorage.setItem(RepositoryKey.FINISHERS, JSON.stringify(value));
  }

  public updateFinishersByCategories(value: IFinishCategory[]) {
    window.localStorage.setItem(RepositoryKey.FINISHERS_BY_CATEGORIES, JSON.stringify(value));
  }

  public updateAnons(value: IFinisher[]) {
    window.localStorage.setItem(RepositoryKey.ANONS, JSON.stringify(value));
  }

  public updateFinisherNameList(value: string[]) {
    window.localStorage.setItem(RepositoryKey.FINISHER_NAME_LIST, JSON.stringify(value));
  }

  public updateCurrentRacerIndex(value: number) {
    window.localStorage.setItem(RepositoryKey.CURRENT_RACER_INDEX, JSON.stringify(value));
  }

  public updateCurrentAnonIndex(value: number) {
    window.localStorage.setItem(RepositoryKey.CURRENT_ANON_INDEX, JSON.stringify(value));
  }

  public updateRaceName(value: string) {
    window.localStorage.setItem(RepositoryKey.RACE_NAME, JSON.stringify(value));
  }

  public updateRacersDelta(value: number) {
    window.localStorage.setItem(RepositoryKey.RACERS_DELTA, JSON.stringify(value));
  }

  public updateRaceType(value: string) {
    window.localStorage.setItem(RepositoryKey.RACE_TYPE, JSON.stringify(value));
  }

  public updateRaceStartTime(value: number | null) {
    window.localStorage.setItem(RepositoryKey.RACE_START_TIME, JSON.stringify(value));
  }

  public updateLapByCategoriesMap(map: Record<string, number>) {
    window.localStorage.setItem(RepositoryKey.LAP_BY_CATEGORY, JSON.stringify(map));
  }

  /**
   * Read
   */

  public readRacers() {
    return JSON.parse(window.localStorage.getItem(RepositoryKey.RACERS)!);
  }

  public readCategoriesMap() {
    return JSON.parse(window.localStorage.getItem(RepositoryKey.CATEGORIES_MAP)!);
  }

  public readStartedRacers() {
    return JSON.parse(window.localStorage.getItem(RepositoryKey.STARTERS)!);
  }

  public readSkippedRacers() {
    return JSON.parse(window.localStorage.getItem(RepositoryKey.SKIPPED_RACERS)!);
  }

  public readStarterNameList() {
    return JSON.parse(window.localStorage.getItem(RepositoryKey.STARTER_NAME_LIST)!);
  }

  public readCurrentRacerIndex() {
    return JSON.parse(window.localStorage.getItem(RepositoryKey.CURRENT_RACER_INDEX)!);
  }

  public readCurrentAnonIndex() {
    return JSON.parse(window.localStorage.getItem(RepositoryKey.CURRENT_ANON_INDEX)!);
  }

  public readFinishers() {
    return JSON.parse(window.localStorage.getItem(RepositoryKey.FINISHERS)!);
  }

  public readFinishersByCategories() {
    return JSON.parse(window.localStorage.getItem(RepositoryKey.FINISHERS_BY_CATEGORIES)!);
  }

  public readAnons() {
    return JSON.parse(window.localStorage.getItem(RepositoryKey.ANONS)!);
  }

  public readFinisherNameList() {
    return JSON.parse(window.localStorage.getItem(RepositoryKey.FINISHER_NAME_LIST)!);
  }

  public readRaceName() {
    return JSON.parse(window.localStorage.getItem(RepositoryKey.RACE_NAME)!);
  }

  public readRacersDelta() {
    return JSON.parse(window.localStorage.getItem(RepositoryKey.RACERS_DELTA)!);
  }

  public readRaceType() {
    return JSON.parse(window.localStorage.getItem(RepositoryKey.RACE_TYPE)!);
  }

  public readRaceStartTime() {
    return JSON.parse(window.localStorage.getItem(RepositoryKey.RACE_START_TIME)!);
  }

  public readLapByCategoriesMap() {
    return JSON.parse(window.localStorage.getItem(RepositoryKey.LAP_BY_CATEGORY)!);
  }

  /**
   * Утилиты
   */

  public checkRacers(): boolean {
    return window.localStorage.getItem(RepositoryKey.RACERS) !== null;
  }

  public collectRaceData() {
    const racers = this.readRacers();
    const categoriesMap = this.readCategoriesMap();
    const starters = this.readStartedRacers();
    const skippedRacers = this.readSkippedRacers();
    const starterNameList = this.readStarterNameList();
    const currentRacerIndex = this.readCurrentRacerIndex();
    const currentAnonIndex = this.readCurrentAnonIndex();
    const finishers = this.readFinishers();
    const finishersByCategories = this.readFinishersByCategories();
    const anons = this.readAnons();
    const finisherNameList = this.readFinisherNameList();
    const raceName = this.readRaceName();
    const racersDelta = this.readRacersDelta();
    const raceType = this.readRaceType();
    const raceStartTime = this.readRaceStartTime();
    const lapByCategoriesMap = this.readLapByCategoriesMap();

    return {
      raceName: raceName ? raceName : DEFAULT_RACE_NAME,
      racers: racers ?? [],
      categoriesMap: categoriesMap ?? {},
      starters: starters ?? [],
      skippedRacers: skippedRacers ?? [],
      starterNameList: starterNameList ?? [],
      currentRacerIndex: currentRacerIndex ?? 0,
      currentAnonIndex: currentAnonIndex ?? 0,
      finishers: finishers ?? [],
      finishersByCategories: finishersByCategories ?? [],
      anons: anons ?? [],
      finisherNameList: finisherNameList ?? [],
      racersDelta: racersDelta ?? DEFAULT_DELTA,
      raceType: raceType ?? RaceType.ITT,
      raceStartTime,
      lapByCategoriesMap,
    };
  }

  public setStateFromJSON(data: ISyncJSON) {
    this.updateRacers(data.racers);
    this.updateCategoriesMap(data.categoriesMap);
    this.updateStartedRacers(data.starters);
    this.updateSkippedRacers(data.skippedRacers ?? []);
    this.updateStarterNameList(data.starterNameList);
    this.updateCurrentRacerIndex(data.currentRacerIndex);
    this.updateCurrentAnonIndex(data.currentAnonIndex);
    this.updateFinishers(data.finishers);
    this.updateFinishersByCategories(data.finishersByCategories);
    this.updateAnons(data.anons);
    this.updateFinisherNameList(data.finisherNameList);
    this.updateRaceName(data.raceName ?? DEFAULT_RACE_NAME);
    this.updateRacersDelta(data.racersDelta ?? DEFAULT_DELTA);
    this.updateRaceType(data.raceType ?? RaceType.ITT);
    this.updateRaceStartTime(data.raceStartTime ?? null);
    this.updateLapByCategoriesMap(data.lapByCategoriesMap ?? {});
  }

  public resetLS() {
    window.localStorage.clear();
  }
}
