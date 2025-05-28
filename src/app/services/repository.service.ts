import { Injectable } from '@angular/core';
import {IFinishCategory, IFinisher} from "../containers/finish-race/finish-race.component";
import { RepositoryKey } from '../models/enums';
import {IRacer, IStarter, ISyncJSON} from "./racers.service";
import {map, tap} from "rxjs";
import {HttpClient} from "@angular/common/http";



@Injectable({
  providedIn: 'root'
})
export class RepositoryService {

  private URL = "../../../../assets/racers.json";
  private URL_SYNC_JSON = "../../../../assets/sync-data.json";

  constructor(private httpClient: HttpClient) {}

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

    return {
      name: "Кутаис 2023",
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

  public setStateFromJSON() {
    this.httpClient.get<ISyncJSON>(this.URL_SYNC_JSON).pipe(
      tap((data: ISyncJSON) => {
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

        window.location.reload();
      })
    ).subscribe();
  }

  public readRacersDataFromJSON() {
    return this.httpClient.get<IRacer[]>(this.URL).pipe(
      map((data: IRacer[]) => {
        const racers: IRacer[] = [];
        const categoriesMap: Record<string, IRacer[]> = {};

        data.forEach((racer) => {
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

        return { racers, categoriesMap };
      })
    )
  }

  public resetLS() {
    window.localStorage.clear();
  }
}
